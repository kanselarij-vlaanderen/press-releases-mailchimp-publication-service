import { app, errorHandler } from 'mu';
import { getNotStartedPublicationTasks, TASK_ONGOING_STATUS } from './lib/publication-task';
import bodyParser from 'body-parser';
import { MAILCHIMP_PUBLICATION_CHANNEL } from './config';

/* Accept application/json format from delta-notifier */
app.use(bodyParser.json({
  type: function(req) { return /^application\/json/.test(req.get('content-type')); }
}));

const requiredEnvironmentVariables = [
  'MAILCHIMP_API',
  'MAILCHIMP_FROM_NAME',
  'MAILCHIMP_REPLY_TO',
  'MAILCHIMP_LIST_ID',
  'MAILCHIMP_INTEREST_CATEGORY_ID',
  'MAILCHIMP_KIND_CATEGORY_ID'
];

let error = false;
requiredEnvironmentVariables.forEach((key) => {
  if (!process.env[key]) {
    console.log(`[ERROR]:Environment variable ${key} must be configured`);
    error = true;
  }
});
if (error) process.exit(1);

app.post('/delta', async function (req, res, next) {
  const delta = req.body;
  const objects = delta
        .map((changeset) => changeset.inserts)
        .flat()
        .map((triple) => triple.object.value);
  if (objects.find(v => v == MAILCHIMP_PUBLICATION_CHANNEL)) {
    console.log("Processing deltas for Mailchimp...");

    const publicationTasks = await getNotStartedPublicationTasks();

    if (publicationTasks) {
      console.log(`Found ${publicationTasks.length} publication tasks to be processed.`);
      for (const publicationTask of publicationTasks) {
        await publicationTask.persistStatus(TASK_ONGOING_STATUS);
      };
      res.sendStatus(202);
      for (const publicationTask of publicationTasks) {
        await publicationTask.process();
      };
    } else {
      console.log(`No publication tasks found to be processed.`);
      return res.status(200).end();
    }
  } else {
    console.log(`Delta message doesn't contain an insert for Mailchimp publication channel`);
    return res.status(200).end();
  }
});

app.post('/cleanup', async function (req, res, next) {
  console.log("Cleaning up Mailchimp...");

  try {
    //cleanup(); uncomment if needed

  } catch (error) {
    console.log(`Something went wrong while cleaning up Mailchimp.`);
    console.log(error);
    res.sendStatus(202);
  }

  console.log(`Cleaning up Mailchimp ended successfully.`);
  return res.status(200).end();
});

app.use(errorHandler);
