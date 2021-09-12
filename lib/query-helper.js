import { querySudo as query } from '@lblod/mu-auth-sudo';
import { MAILCHIMP_PUBLICATION_CHANNEL, PUBLIC_GRAPH } from '../config';

export async function getPressReleaseContent(graph, pressReleaseUri) {
  const result = await query(`
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
    PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX ebucore: <http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#>

    SELECT ?title ?htmlContent ?startDate WHERE {
      GRAPH <${graph}> {
        <${pressReleaseUri}> a fabio:PressRelease ;
          nie:title ?title ;
          nie:htmlContent ?htmlContent ;
          ebucore:isScheduledOn ?publicationEvent .
        ?publicationEvent a ebucore:PublicationEvent ;
          ebucore:publicationStartDateTime ?startDate .
      }
    } LIMIT 1
  `);

  const binding = result.results.bindings[0];
  const themes = await getPressReleaseThemes(graph, pressReleaseUri);
  const sources = await getPressReleaseSources(graph, pressReleaseUri);

  let pressRelease = {  title: binding['title'].value,
                        content: binding['htmlContent'].value,
                        publicationDate: binding['startDate'].value,
                        themes: themes,
                        sources: sources }
  return pressRelease;
}

async function getPressReleaseThemes(graph, pressReleaseUri) {
  const themesResult = await query(`
    PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT ?label WHERE {
      GRAPH <${graph}> {
        <${pressReleaseUri}> a fabio:PressRelease ;
          dcat:theme ?theme .
      }
      GRAPH <${PUBLIC_GRAPH}> {
        ?theme ext:mailchimpId ?label .
      }
    }
  `);

  return themesResult.results.bindings.map(t => t['label'].value);
}

async function getPressReleaseSources(graph, pressReleaseUri) {
  const result = await query(`
      PREFIX fabio: <http://purl.org/spar/fabio/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX ebucore: <http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#>
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

      SELECT ?source ?fullName ?function ?telephone ?mobile ?email ?organization WHERE {
        GRAPH <${graph}> {
          <${pressReleaseUri}> a fabio:PressRelease;
            dct:source ?source .
          ?source a ebucore:Contact ;
            vcard:fn ?fullName .
          OPTIONAL { ?source vcard:role ?function }
          OPTIONAL {
              ?source vcard:hasTelephone ?telephoneURI .
              ?telephoneURI a vcard:Voice ;
                vcard:hasValue ?telephone ;
                ext:publicationChannel <${MAILCHIMP_PUBLICATION_CHANNEL}> .
          }
          OPTIONAL {
              ?source ext:hasMobile ?mobileURI .
              ?mobileURI a vcard:Cell;
                vcard:hasValue ?mobile;
                ext:publicationChannel <${MAILCHIMP_PUBLICATION_CHANNEL}> .
          }
          OPTIONAL {
              ?source vcard:hasEmail ?emailURI .
              ?emailURI a vcard:Email ;
                vcard:hasValue ?email ;
                ext:publicationChannel <${MAILCHIMP_PUBLICATION_CHANNEL}> .
          }
        }
        OPTIONAL{
          GRAPH <${PUBLIC_GRAPH}> {
            ?organizationURI a vcard:Organization ;
               vcard:fn ?organization  .
          }
          GRAPH <${graph}> {
            ?organizationURI  org:hasMember ?source .
          }
        }
      }
  `);

  return result.results.bindings.map(mapBindingValue);
}


export function mapBindingValue(binding) {
  const result = {};
  for (let key in binding) {
      result[key] = binding[key].value;
  }
  return result;
}