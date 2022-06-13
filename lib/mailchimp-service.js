import Handlebars from 'handlebars';
import mailchimpConnection from '@mailchimp/mailchimp_marketing';
import { getMailTemplatePath, getPressReleaseContent, savePressReleaseText } from './query-helper';
import { readFileSync, writeFileSync } from 'fs';
import { format } from 'date-fns';
import { nlBE } from 'date-fns/locale';
import formatTelephone from '../helpers/format-telephone';
import formatEmail from '../helpers/format-email';

const IMAGE_HOST = process.env.IMAGE_HOST || 'http://localhost';
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
      console.log("The Mailchimp connection is working correctly.");
    } else {
      console.log("Could not connect to Mailchimp.", response);
      throw (response);
    }
  }

  async createTemplate(subject, html) {
    console.log(`Creating Mailchimp template...`);

    const template = {
      name: subject,
      html: html
    };
    const templateResponse = await mailchimpConnection.templates.create(template);
    const templateId = templateResponse['id'];
    console.log(`Mailchimp templateResponse template id: ${templateId}`);
    return templateId;
  }

  async createNewCampaign(templateId, subject, title, themes) {
    console.log(`Creating Mailchimp campaign for template ${templateId}...`);
    const themeCondition = await this.createThemesCondition(themes);
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
        subject_line: subject,
        preview_text: subject,
        title: title,
        from_name: FROM_NAME,
        reply_to: REPLY_TO,
        inline_css: true,
        template_id: templateId,
      }
    };
    const campaignResponse = await mailchimpConnection.campaigns.create(campaign);

    const campaignId = campaignResponse['id'];

    console.log(`Mailchimp campaignResponse campaign id: ${campaignId}`);
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
    const wait = function(ms) {
      new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    };
    console.log(`Retrying to delete mail campaign ${campaignId}. ${numberOfTries} retries left.`);
    if (numberOfTries <= 0) {
      console.log(`Could not delete Mailchimp campaign ${campaignId}`);
    } else {
      try {
        const result = await mailchimpConnection.campaigns.remove(campaignId);

        if (result && result.status === 200) {
          return result;
        } else {
          console.log(`Failed to delete Mailchimp campaign ${campaignId}`);
        }
      }
      catch (error) {
        await wait(timeout);
        return this.retryDeleteCampaign(campaignId, numberOfTries - 1, timeout);
      }
    }
  };

  async sendCampaign(campaignId) {
    await mailchimpConnection.campaigns.send(campaignId);
  }

  async createThemesCondition (pressReleaseThemes) {
    const uniquePressReleaseThemes = [...new Set(pressReleaseThemes)];
    const interests = await this.fetchInterestsByCategoryIdFromLists(INTEREST_CATEGORY_ID);
    const interestMapping = interests.filter((theme) => uniquePressReleaseThemes.includes(theme.name));

    return {
      condition_type: 'Interests',
      field: `interests-${INTEREST_CATEGORY_ID}`,
      op: 'interestcontains',
      value: interestMapping.map((item) => item.id)
    };
  };

  async createKindCondition () {
    const interestedKinds = await this.fetchInterestsByCategoryIdFromLists(KIND_CATEGORY_ID);
    const interestKindMapping = interestedKinds.filter((interest) => DECISION_STRINGS.includes(interest.name));
    return {
      condition_type: 'Interests',
      field: `interests-${KIND_CATEGORY_ID}`,
      op: 'interestcontains',
      value: interestKindMapping.map((item) => item.id)
    };
  };

  async fetchInterestsByCategoryIdFromLists(categoryId) {
    const interestsResponse = await mailchimpConnection.lists.listInterestCategoryInterests(LIST_ID, categoryId, {count: 100});
    return interestsResponse.interests;
  }

  async cleanup() {
    const templatesList = await mailchimpConnection.templates.list({count: 1000});
    for (let template of templatesList.templates) {
      if (template["type"] === "user") {
        await this.deleteTemplate(template["id"]);
      }
    }

    const campaignsList = await mailchimpConnection.campaigns.list({count: 1000});
    for (let campaign of campaignsList.campaigns) {
      await this.deleteCampaign(campaign["id"]);
    }
  }
}

const mailchimp = new Mailchimp();

export async function createEmailContent(publicationTask, pressReleaseUri) {
  console.log("Generating Mailchimp HTML content...");
  const pressRelease = await getPressReleaseContent(pressReleaseUri);

  const publicationDate = format(pressRelease.publicationDate, 'd MMMM yyyy', { locale: nlBE });
  const mailSubject = `Persbericht van ${publicationDate}`;
  const htmlContent = await generateHtmlContent(pressRelease);
  await savePressReleaseText(publicationTask, htmlContent);

  return {
    subject: mailSubject,
    html: htmlContent,
    ...pressRelease,
  };
}

async function generateHtmlContent(pressRelease) {
  const filePath = await getMailTemplatePath(pressRelease.uri);
  if (filePath) {
    console.log(`Retrieving mail template from ${filePath}`);
    const templateSource = readFileSync(filePath, 'utf8');

    // Register helpers for handlebars file
    Handlebars.registerHelper('fmt-telephone', formatTelephone);
    Handlebars.registerHelper('fmt-email', formatEmail);

    // Create email generator
    const template = Handlebars.compile(templateSource);

    // Generate HTML with filled in variables
    const html = template({
      title: pressRelease.title,
      content: pressRelease.content,
      creatorName: pressRelease.creatorName,
      sources: pressRelease.sources,
      date: format(pressRelease.publicationDate, 'eeee d MMMM yyyy', { locale: nlBE }),
      imageHost: IMAGE_HOST
    });

    // Write output to file for debugging
    if (process.env.NODE_ENV == 'development') {
      writeFileSync('/share/mailchimp-template-output.html', html, 'utf8');
    }

    return html;
  } else {
    throw new Error(`No template found for creator of press-release ${pressRelease}`);
  }
}


export async function publishToMailchimp(pressReleaseData) {
  console.log("Publishing press release to Mailchimp...");

  try {
    await mailchimp.ping();
    const { subject, title, html, themes } = pressReleaseData;
    const templateId = await mailchimp.createTemplate(subject, html);
    const campaignId = await mailchimp.createNewCampaign(templateId, subject, title, themes);
    await mailchimp.deleteTemplate(templateId);
    await mailchimp.sendCampaign(campaignId);
    await mailchimp.deleteCampaign(campaignId);

  } catch (error) {
    console.log('A problem occured when sending the press release to Mailchimp.');
    if (error.response) {
      console.log(`${error.status} ${error.response.body.title}: ${error.response.body.detail}`);
    } else {
      console.log(error);
    }
  }
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
