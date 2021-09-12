import mailchimpConnection from '@mailchimp/mailchimp_marketing';
import { createNewsLetter } from './mailchimp-template';
import moment from 'moment';
import 'moment-timezone';

moment.locale('nl');

const MAILCHIMP_API = process.env.MAILCHIMP_API;
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER || "us3";
const FROM_NAME = process.env.MAILCHIMP_FROM_NAME;
const REPLY_TO = process.env.MAILCHIMP_REPLY_TO;
const LIST_ID = process.env.MAILCHIMP_LIST_ID;
const INTEREST_CATEGORY_ID = process.env.MAILCHIMP_INTEREST_CATEGORY_ID;
const KIND_CATEGORY_ID = process.env.MAILCHIMP_KIND_CATEGORY_ID;

const DECISION_STRINGS = ['Ik ontvang enkel persberichten', 'Ik ontvang zowel persberichten als beslissingen'];

class Mailchimp {
  constructor() {
    mailchimpConnection.setConfig(
      {
        apiKey: `${MAILCHIMP_API}`,
        server: `${MAILCHIMP_SERVER}`
      });
  }

  async ping() {
    const response = await mailchimpConnection.ping.get();

    if (response.health_status) {
      console.log("The Mailchimp connection is working correctly.")
    } else {
      console.log("Could not connect to Mailchimp.", response);
      throw (response);
    }
  }

  async createTemplate(pressReleaseData) {
    console.log(`Creating Mailchimp template...`);

    const html = createNewsLetter(pressReleaseData.title, pressReleaseData.htmlContent, pressReleaseData.formattedStart);

    const template = {
      name: pressReleaseData.mailTitle,
      html: html
    }
    const templateResponse = await mailchimpConnection.templates.create(template);

    const templateId = templateResponse['id']

    console.log(`templateResponse template id: ${templateId}`);
    return templateId;
  }

  async createNewCampaign(templateId, pressReleaseData) {
    const themeCondition = await this.createThemesCondition(pressReleaseData.themes);
    const kindCondition = await this.createKindCondition();

    const campaign = {
      type: "regular",
      recipients: {
        list_id: LIST_ID,
        segment_opts: {
          match: 'all',
          conditions: [themeCondition, kindCondition]
        }
      },
      settings: {
        subject_line: pressReleaseData.mailTitle,
        preview_text: pressReleaseData.mailTitle,
        title: pressReleaseData.mailTitle,
        from_name: FROM_NAME,
        reply_to: REPLY_TO,
        inline_css: true,
        template_id: templateId,
      }
    }
    const campaignResponse = await mailchimpConnection.campaigns.create(campaign)

    const campaignId = campaignResponse['id']

    console.log(`campaignResponse campaign id: ${campaignId}`);
    return campaignId;
  }

  async deleteTemplate(templateId) {
    console.log(`Deleting Mailchimp template ${templateId}...`);

    await mailchimpConnection.templates.deleteTemplate(templateId);

    console.log(`Deleting Mailchimp template ${templateId} DONE`);

  }

  async deleteCampaign(campaignId) {
    console.log(`Deleting Mailchimp campaign ${campaignId}...`);

    await this.retryDeleteCampaign(campaignId, 4, 2000);

    console.log(`Deleting Mailchimp campaign ${campaignId} DONE`);
  }

  async retryDeleteCampaign(campaignId, numberOfTries, timeout) {
    console.log(numberOfTries);
    if (numberOfTries <= 0) {
      console.log(`Could not delete Mailchimp campaign ${campaignId}`);
      return;
    }
    try {
      const result = await mailchimpConnection.campaigns.remove(campaignId);

      if (result && result.status === 200) {
        return result;
      }
    }
    catch (error) {
      await this.wait(timeout);
      return this.retryDeleteCampaign(campaignId, numberOfTries - 1, timeout);
    }
  }

  async sendCampaign(campaignId) {
    await mailchimpConnection.campaigns.send(campaignId);
  }

  async createThemesCondition (allThemesOfNewsletter) {
    const allUniqueThemesOfNewsletter = [...new Set(allThemesOfNewsletter)];
    const interests = await this.fetchInterestsByCategoryIdFromLists(INTEREST_CATEGORY_ID);
    const interestMapping = interests.filter((theme) => {
      if (allUniqueThemesOfNewsletter.includes(theme.name)) {
        return theme;
      }
    });

    return {
      condition_type: 'Interests',
      field: `interests-${INTEREST_CATEGORY_ID}`,
      op: 'interestcontains',
      value: interestMapping.map((item) => item.id)
    };
  };

  async createKindCondition () {
    const interestedKinds = await this.fetchInterestsByCategoryIdFromLists(KIND_CATEGORY_ID);
    const interestKindMapping = interestedKinds.filter((interest) => {
      if (DECISION_STRINGS.includes(interest.name)) {
        return interest;
      }
    });
    return {
      condition_type: 'Interests',
      field: `interests-${KIND_CATEGORY_ID}`,
      op: 'interestcontains',
      value: interestKindMapping.map((item) => item.id)
    };
  };

  async fetchInterestsByCategoryIdFromLists(categoryId) {
    const interestsResponse = await mailchimpConnection.lists.listInterestCategoryInterests(LIST_ID, categoryId)

    return interestsResponse.interests;
  }

  async cleanup() {
    const templatesList = await mailchimpConnection.templates.list({count: 1000});
    for (let template of templatesList.templates) {
      if (template["type"] === "user") {
        await this.deleteTemplate(template["id"]);
      }
    }

    const campaignsList = await mailchimpConnection.campaigns.list({cont: 1000});
    for (let campaign of campaignsList.campaigns) {
      await this.deleteCampaign(campaign["id"]);
    }
  }

  async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}


const mailchimp = new Mailchimp();


export async function publishToMailchimp(pressReleaseData) {
  console.log("Publishing press release to Mailchimp...");

  try {
    await mailchimp.ping();


    const formattedStart = moment(pressReleaseData.publicationDate).format('DD MMMM YYYY');
    const mailTitle = `Persbericht van ${formattedStart}`;
    const htmlContent = generateHtmlContent(pressReleaseData.content, pressReleaseData.sources)

    pressReleaseData = {
      formattedStart: formattedStart,
      mailTitle: mailTitle,
      htmlContent: htmlContent,
      ...pressReleaseData,
    }

    const templateId = await mailchimp.createTemplate(pressReleaseData);
    const campaignId = await mailchimp.createNewCampaign(templateId, pressReleaseData);
    await mailchimp.deleteTemplate(templateId);
    await mailchimp.sendCampaign(campaignId);
    await mailchimp.deleteCampaign(campaignId);

  } catch (error) {
    console.log("A problem occured when sending the press release to Mailchimp.");
    if (error.response) {
      console.log(`${error.status} ${error.response.body.title}: ${error.response.body.detail}`);
    } else {
      console.log(error);
    }
  }
}

function generateHtmlContent(content, sources) {
  let html = "";

  if (sources && sources.length) {
    html += `<p>Bron:</p>`;
    for (const source of sources) {
      html += `<p>${source.organization}</p>`;
      html += `<p>${source.fullName}, ${source.function}`;
      if (source.telephone) html += ` ${source.telephone}`;
      if (source.mobile) html += ` ${source.mobile}`;
      if (source.email) html += ` ${source.email}`;
      html += `</p>`;
    }
  }

  html += `<p>${content}</p>`;

  return html;
}

export async function cleanup() {
  try {
    await mailchimp.cleanup();

  } catch (error) {
    console.log("A problem occured while cleaning up Mailchimp.");
    if (error.response) {
      console.log(`${error.status} ${error.response.body.title}: ${error.response.body.detail}`);
    } else {
      console.log(error);
    }
  }
}

