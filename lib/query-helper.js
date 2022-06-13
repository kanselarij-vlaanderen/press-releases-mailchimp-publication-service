import { querySudo as query, updateSudo as update } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString, sparqlEscapeDateTime } from 'mu';
import { MAILCHIMP_PUBLICATION_CHANNEL, PUBLIC_GRAPH } from '../config';
import { parseISO } from 'date-fns';

export async function getMailTemplatePath(pressReleaseUri) {
  const result = await query(`
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
    PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT ?template WHERE {
      GRAPH ?g {
        <${pressReleaseUri}> a fabio:PressRelease ;
           dct:creator ?organization .
      }
      GRAPH <${PUBLIC_GRAPH}> {
        ?organization ext:mailchimpTemplate ?virtualFile .
        ?template nie:dataSource ?virtualFile .
      }
    } LIMIT 1
  `);

  if (result.results.bindings.length) {
    return result.results.bindings[0]['template'].value.replace('share://', '/share/');
  } else {
    return null;
  }
}

export async function getPressReleaseContent(pressReleaseUri) {
  const q = `
    PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
    PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX ebucore: <http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?title ?htmlContent ?startDate ?creatorName ?publicationEvent WHERE {
      GRAPH ?graph {
        <${pressReleaseUri}> a fabio:PressRelease ;
          nie:title ?title ;
          nie:htmlContent ?htmlContent ;
          dct:creator ?creator ;
          ebucore:isScheduledOn ?publicationEvent .
        ?publicationEvent a ebucore:PublicationEvent ;
          ebucore:publicationStartDateTime ?startDate .
      }
      GRAPH <${PUBLIC_GRAPH}> {
        OPTIONAL { ?creator vcard:fn ?creatorFullName }
        OPTIONAL { ?creator foaf:name ?creatorShortName }
        BIND(IF(BOUND(?creatorShortName), ?creatorShortName, ?creatorFullName) as ?creatorName)
      }
    } LIMIT 1
  `;
  const result = await query(q);

  const binding = result.results.bindings[0];
  const sources = await getPressReleaseSources(pressReleaseUri);
  const themes = await getPressReleaseThemes(pressReleaseUri);

  let pressRelease = {
    uri: pressReleaseUri,
    title: binding['title'].value,
    content: binding['htmlContent'].value,
    publicationDate: parseISO(binding['startDate'].value),
    creatorName: binding['creatorName'] ? binding['creatorName'].value: null,
    publicationEvent: binding['publicationEvent'].value,
    sources,
    themes
  };
  return pressRelease;
}

async function getPressReleaseThemes(pressReleaseUri) {
  const themesResult = await query(`
    PREFIX fabio: <http://purl.org/spar/fabio/>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

    SELECT ?label WHERE {
      GRAPH ?graph {
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

async function getPressReleaseSources(pressReleaseUri) {
  const result = await query(`
      PREFIX fabio: <http://purl.org/spar/fabio/>
      PREFIX dct: <http://purl.org/dc/terms/>
      PREFIX ebucore: <http://www.ebu.ch/metadata/ontologies/ebucore/ebucore#>
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>

      SELECT ?source ?fullName ?function ?telephone ?mobile ?email ?organization WHERE {
        GRAPH ?graph {
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
        OPTIONAL {
          GRAPH <${PUBLIC_GRAPH}> {
            ?organizationURI a vcard:Organization ;
               vcard:fn ?organization  .
          }
          GRAPH ?graph {
            ?organizationURI org:hasMember ?source .
          }
        }
      }
  `);

  return result.results.bindings.map(mapBindingValue);
}


export async function savePressReleaseText(taskUri, htmlContent) {
  await update(`
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
      PREFIX dct: <http://purl.org/dc/terms/>

      INSERT {
        GRAPH ?graph {
          <${taskUri}> nie:htmlContent ${sparqlEscapeString(htmlContent)} ;
            dct:modified ${sparqlEscapeDateTime(new Date())} .
        }
      } WHERE {
        GRAPH ?graph {
          <${taskUri}> a ext:PublicationTask .
        }
      }
    `);
}

export function mapBindingValue(binding) {
  const result = {};
  for (let key in binding) {
      result[key] = binding[key].value;
  }
  return result;
}
