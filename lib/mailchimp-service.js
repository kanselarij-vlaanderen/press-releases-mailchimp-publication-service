const mailchimp = require('@mailchimp/mailchimp_marketing');
import { createKindCondition, createNewsLetter, createThemesCondition, sendCampaign } from './mailchimp-helper';

import moment from 'moment';

const MAILCHIMP_API = process.env.MAILCHIMP_API;
const FROM_NAME = process.env.MAILCHIMP_FROM_NAME;
const REPLY_TO = process.env.MAILCHIMP_REPLY_TO;
const LIST_ID = process.env.MAILCHIMP_LIST_ID;
const INTEREST_CATEGORY_ID = process.env.MAILCHIMP_INTEREST_CATEGORY_ID;
const KIND_CATEGORY_ID = process.env.MAILCHIMP_KIND_CATEGORY_ID;

const DECISION_STRINGS = ['Ik ontvang enkel beslissingen', 'Ik ontvang zowel persberichten als beslissingen'];

moment.locale('nl');


mailchimp.setConfig(
  {
    apiKey: `${MAILCHIMP_API}`,
    server: "us3"
  });


export async function publishToMailchimp() {
  console.log("Publishing press release to Mailchimp...");

  const response = await mailchimp.ping.get();
  console.log(response);

  createCampaign();

}

async function createCampaign() {
  try {
    const templateId = await createTemplate();
    const campaignId = await createNewCampaign(templateId);
    await deleteTemplate(templateId);
    await sendCampaign(mailchimp, campaignId);
    await deleteCampaign(campaignId);
  } catch (error) {
    console.log("A problem occured when sending the press release to Mailchimp.");
    console.log(`${error.status} ${error.response.body.title}: ${error.response.body.detail}`);
  }
}

async function createTemplate() {
  console.log(`Creating Mailchimp template...`);
  const html = createNewsLetter();

  const template = {
    name: 'De naam van mijn template',
    html: html
  }
  const templateResponse = await mailchimp.templates.create(template);

  const templateId = templateResponse['id']

  console.log(`templateResponse template id: ${templateId}`);
  return templateId;
}

async function createNewCampaign(templateId) {
  //const themeCondition = await createThemesCondition(themesOfNewsletter);
  //const kindCondition = await createKindCondition();

  const campaign = {
    type: "regular",
    recipients: {
      list_id: LIST_ID,
      segment_opts: {
        match: 'all'
       // conditions: [themeCondition, kindCondition]
      }
    },
    settings: {
      subject_line: 'This is the subject line',
      preview_text: 'The is the preview text',
      title: 'This is the title',
      from_name: FROM_NAME,
      reply_to: REPLY_TO,
      inline_css: true,
      template_id: templateId,
    }
  }
  const campaignResponse = await mailchimp.campaigns.create(campaign)

  const campaignId = campaignResponse['id']

  console.log(`campaignResponse campaign id: ${campaignId}`);
  return campaignId;
}

async function deleteTemplate(templateId) {
  console.log(`Deleting Mailchimp template ${templateId}...`);

  await mailchimp.templates.deleteTemplate(templateId);

  console.log(`Deleting Mailchimp template ${templateId} DONE`);

}

async function deleteCampaign(campaignId) {
  console.log(`Deleting Mailchimp campaign ${campaignId}...`);

  await mailchimp.campaigns.remove(campaignId);

  console.log(`Deleting Mailchimp campaign ${campaignId} DONE`);
}

