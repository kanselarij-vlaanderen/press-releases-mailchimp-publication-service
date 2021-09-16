# press-releases-mailchimp-publication-service

This microservice looks for publication tasks that have its publication-channel set to "Abonnees Vlaanderen.be", are not
started yet (`adms:status`) and its publication-event has no `ebucore:publicationEndDateTime` yet.

For every result found, it generates a campaign in Mailchimp from where mails are sent out to the users interesteded in the topic of the related press reelase.

## Tutorials
### Add the service to a stack
Add the service to your `docker-compose.yml`:

```yaml
services:
  mailchimp-publication:
    image: kanselarij/press-releases-mailchimp-publication-service:0.1.0
    restart: always
    logging: *default-logging
```

Next, make the service listen for new conversion tasks. Assuming a delta-notifier is already available in the stack, add the following rules to the delta-notifier's configuration in `./config/delta/rules.js`.

```javascript
{
    match: {
        predicate: {
            type: 'uri',
            value: 'http://www.w3.org/ns/adms#status'
        },
        object: {
            type: 'uri',
            value: 'http://themis.vlaanderen.be/id/concept/publication-task-status/not-started'
        },
    },
    callback: {
        url: 'http://mailchimp-publication/delta',
        method: 'POST'
    },
    options: {
        resourceFormat: 'v0.0.1',
        gracePeriod: 250,
        ignoreFromSelf: true
    },
}
```

## Reference

### Configuration

The following environment variables have to be configured:

| Key | type | description |
|-----|------|---------|
| MAILCHIMP_API | string | api key to connect to mailchimp |
| MAILCHIMP_REPLY_TO | string | mail address to be used as sender address |
| MAILCHIMP_FROM_NAME | string | name to be used as sender details |
| MAILCHIMP_LIST_ID | string | the list containing the subscribers
| MAILCHIMP_INTEREST_CATEGORY_ID | string  | the list of interest categories (themes) linked to the list
| MAILCHIMP_KIND_CATEGORY_ID | string  | the list of kind categories linked to the list
| MAILCHIMP_SERVER | string  | the Mailchimp server to connect to. Default value 'us3'


The service will fail if the environment variables are not defined properly.


### Model

#### Used prefixes
| Prefix | URI                                                       |
|--------|-----------------------------------------------------------|
| dct    | http://purl.org/dc/terms/                                 |
| adms   | http://www.w3.org/ns/adms#                                |
| ext    | http://mu.semte.ch/vocabularies/ext                       |
| nie    | http://www.semanticdesktop.org/ontologies/2007/01/19/nie# |


#### Publication task
##### Class
`ext:PublicationTask`
##### Properties
| Name                | Predicate                | Range           | Definition                                                                                                                                                 |
|---------------------|--------------------------|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| status              | `adms:status`            | `rdfs:Resource` | Status of the publication task, having value `<http://themis.vlaanderen.be/id/concept/publication-task-status/not-started>` when this service is triggered |
| created             | `dct:created`            | `xsd:dateTime`  | Datetime of creation of the task                                                                                                                           |
| modified            | `dct:modified`           | `xsd:dateTime`  | Datetime of the last modification of the task                                                                                                              |
| publication-channel | `ext:publicationChannel` | `rdfs:Resource` | Publication channel related to the task. Only the 'Abonnees Vlaanderen.be' publication channel (`http://themis.vlaanderen.be/id/publicatiekanaal/c06c30f5-d9e9-490e-822c-43faa9d0b25e`) is of interest to this service                                              |


#### Publication task statuses
The status of the publication task will be updated to reflect the progress of the task. The following statuses are known:
* http://themis.vlaanderen.be/id/concept/publication-task-status/not-started
* http://themis.vlaanderen.be/id/concept/publication-task-status/ongoing
* http://themis.vlaanderen.be/id/concept/publication-task-status/success
* http://themis.vlaanderen.be/id/concept/publication-task-status/failed

### API
```
POST /delta
```
Endpoint that receives delta's from the delta-notifier and executes a publication task when this task is ready for publication. A successfully completed publication task will result in emails being sent to the subscribers defined in Mailchimp.
The endpoint is triggered externally whenever a publication task is ready for processing and is not supposed to be triggered manually.

### Responses

| status | description |
|-------|-------------|
| 202 | Accepted, request to check for publication-tasks is successfully received. |








