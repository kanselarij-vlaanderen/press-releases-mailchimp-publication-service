const LIST_ID = process.env.MAILCHIMP_LIST_ID;
const INTEREST_CATEGORY_ID = process.env.MAILCHIMP_INTEREST_CATEGORY_ID;

/**
 * Creates a mailchimp html-template for the mailchimp service
 * based on a Vlivia press release.
 */
export function createNewsLetter () {

	return `
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<title>*|MC:SUBJECT|*</title>

	<style type="text/css">
	 .ExternalClass *{
	     line-height:100%;
	 }
	 body{
	     margin:0;
	     padding:0;
	     font-family:Calibri,Arial,sans-serif;
	 }
	 p{
	     margin:0;
	     padding:0;
	     margin-bottom:10px;
	 }
	 ul,ol{
	     margin:5px 0 15px;
	     padding:0 0 0 15px;
	 }
	 strong,b{
	     color:#333332;
	     font-weight:600;
	 }
	 table{
	     border-collapse:collapse;
	     table-layout:fixed;
	     border-spacing:0;
	     mso-table-lspace:0;
	     mso-table-rspace:0;
	 }
	 td{
	     mso-table-lspace:0;
	     mso-table-rspace:0;
	     overflow: hidden;
  	     text-overflow: ellipsis;
  	     word-break: break-word;
	 }
	 .link{
	     color:#0066cc;
	 }
	 .read-more{
	     color:#0066cc;
	     text-decoration:none;
	 }
	 .button a{
	     color:#FFFFFF;
	     text-decoration:none;
	 }
	 .agenda-title a{
	     color:#0066cc;
	     text-decoration:none;
	 }
	 .agenda-text a{
	     color:#000000;
	     text-decoration:none;
	 }
	 .item-image img{
	     border:1px solid #e5e7e8;
	 }
	 .no-underline{
	     text-decoration:none;
	 }
	 .intro-tekst{
	     color:#666666;
	     font-family:Calibri,Arial,sans-serif;
	     font-size:15px;
	     line-height:20px;
	     margin-top:5px;
	     margin-bottom:0;
	 }
	 @media only screen and (max-width: 660px){
	     table[class=full-table]{
	         width:100% !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .no-mobile{
	         display:none !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .header-text{
	         padding:30px 20px !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .header-image{
	         width:100% !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .footer-sublogo{
	         width:100% !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .footer-text{
	         width:auto !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .footer-container{
	         padding:15px !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .content-container{
	         padding:20px 20px 40px !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .item-text-container{
	         width:auto !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .item-image{
	         width:90px !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .item-title{
	         width:calc(100% - 100px) !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .item-text{
	         padding:20px 0 0 !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .section-title-border{
	         width:100px !important;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .word-break{
	         word-break:break-word;
	     }

	 }\t@media only screen and (max-width: 660px){
	     .thumbnail-image{
	         width:90px !important;
	     }

	 }</style></head>
    <body bgcolor="#e8ebee">
	<!-- wrapper table -->
	<table cellpadding="0" cellspacing="0" width="100%" border="0" class="container" bgcolor="#e8ebee">
	    <tr>
	        <td>
	            <!-- preheader -->
	            <table mc:repeatable="preheader" mc:variant="Preheader: Geel" width="650" cellpadding="0" cellspacing="0" border="0" align="center" class="full-table" bgcolor="#FFFFFF" style="width:650px;">
	                <tr>
	                    <td>
	                        <img src="https://gallery.mailchimp.com/79d9da50466bd74e2bcf97d45/images/6380d63b-2b09-4642-9635-8961be48655d.png" alt="Vlaanderen" width="140" style="width: 140px; vertical-align: top;">
	                    </td>
	                    <td class="no-mobile" style="text-align:right;padding-right:15px;color:#0066cc;">
	                        <a href="*|ARCHIVE|*" style="font-family:Calibri, Arial, sans-serif;font-size:12px;color:#0066cc;">Mail onleesbaar? Bekijk de online versie</a>
	                    </td>
	                </tr>
	                <tr>
	                    <td colspan="2" style="border-bottom:3px solid #ffe615;line-height:0;">

	                    </td>
	                </tr>
	                <tr>
	                    <td colspan="2" style="border-bottom:1px solid #cbd2da;line-height:0;">
	                    </td>
	                </tr>
	            </table>
	            <!-- end preheader -->
	            <div mc:edit="header_content">
	                <!-- header basic -->
	                <table mc:repeatable="header" width="650" cellpadding="0" cellspacing="0" border="0" align="center" class="full-table" style="width:650px; table-layout:auto; !important">
			    <tr>
				<td height="10" style="height: 10px;line-height: 0;mso-table-lspace: 0;mso-table-rspace: 0;">
				    &nbsp;
				</td>
			    </tr>
	                    <tr>
				<td valign="middle" style="background:#FFFFFF;">
				    <table cellpadding="0" cellspacing="0" border="0" align="left" style="border-collapse: collapse;border-spacing: 0;mso-table-lspace: 0;mso-table-rspace: 0;">
					<tr>
					    <td class="header-text" style="padding: 30px 15px 30px 40px;background-color: #FFFFFF;mso-table-lspace: 0;mso-table-rspace: 0; max-width:650px;">
						<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;border-spacing: 0;mso-table-lspace: 0;mso-table-rspace: 0;">
						    <tr>
							<td style="border-left: 4px solid #ffe615;padding-left: 15px;mso-table-lspace: 0;mso-table-rspace: 0;">
							    <font style="font-family: Calibri, Arial, sans-serif; font-weight: 600; font-size: 22px; line-height: 22px; color: #333332; text-transform: uppercase;">Persbericht</font>
							    <br>
							    <font style="font-family: Calibri, Arial, sans-serif; font-size: 18px; line-height: 18px; color: #333332;">
				                                2 september 2021
							    </font>
							</td>
						    </tr>
						</table>
					    </td>
					</tr>
				    </table>
	                        </td>
		            </tr>
		            <tr>
			        <td colspan="2" height="10" style="height: 10px;line-height: 0;mso-table-lspace: 0;mso-table-rspace: 0;">
				    &nbsp;
			        </td>
	                    </tr>
	                </table>
	                <!-- end header basic -->
		    </div> <!-- END header_content editabe div -->
	            <div mc:edit="std_content00">
			<!-- content -->
			<table width="650" cellpadding="0" cellspacing="0" border="0" align="center" class="full-table" bgcolor="#FFFFFF" style="width:650px;">
			    <tr>
				<td class="content-container" style="padding:20px 55px 40px 55px;">
	                            <!-- section title -->
                                    <table mc:repeatable="content" mc:variant="Sectie Titel" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td height="25" style="height:25px;line-height:0;">

                                            </td>
					</tr>
                                        <tr>
                                            <td width="100%" colspan="2">
                                                <h2 class="section-title" style="color:#333332;font-family:Calibri, Arial, sans-serif;font-weight:600;font-size:22px;text-transform:uppercase;margin:0;">
                                                    Dit is een Vlivia persbericht over COVID-19
                                                </h2>
                                            </td>
					</tr>
                                        <tr>
                                            <td width="130" style="border-bottom:3px solid #333332;line-height:0;">

                                            </td>
                                            <td class="section-title-border" width="410" style="border-bottom:3px solid #cbd2da;line-height:0;">

					    </td>
                                        </tr>
				    </table>
				    <br/>
                                    <table mc:repeatable="content" mc:variant="Tekstblok met introtekst" width="100%" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td height="30" style="height:30px;line-height:0;">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="color:#666666;font-family:Calibri, Arial, sans-serif;font-size:17px;line-height:26px;">
                                                HTML inhoud van het persbericht hier
                                            </td>
                                        </tr>
                                    </table>

	            </div> <!-- END std_content00 editabe div -->
		    <!-- footer -->
	            <table mc:repeatable="footer" mc:variant="Footer: Basic" width="650" cellpadding="0" cellspacing="0" border="0" align="center" class="full-table" bgcolor="#FFFFFF" style="width:650px;">
	                <tr>
	                    <td class="footer-container" style="border-top:1px solid #cbd2da;padding:20px 55px;">
	                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
	                            <tr>
	                                <td valign="top">
	                                    <!-- footer logo -->
	                                    <table width="150" cellpadding="0" cellspacing="0" border="0" align="left" class="footer-logo">
	                                        <tr>
	                                            <td>
	                                                <img src="https://gallery.mailchimp.com/79d9da50466bd74e2bcf97d45/images/40648791-7fe7-476c-899f-ee849e1c9917.png" alt="Vlaanderen" width="130" style="width: 130px;">
	                                            </td>
	                                        </tr>
	                                    </table>
	                                    <!-- end footer logo -->
	                                    <!-- footer text -->
	                                    <table width="375" cellpadding="0" cellspacing="0" border="0" align="right" class="footer-text">
	                                        <tr>
	                                            <td style="padding-top:10px;">
	                                                <font style="font-family:Calibri, Arial, sans-serif;font-size:15px;font-weight:600;line-height:17px;color:#333332;">
	                                                    Dit is een officiële nieuwsbrief van de Vlaamse overheid
	                                                </font>
	                                                <br>
	                                                <br>
	                                                <font style="font-family:Calibri, Arial, sans-serif;font-size:13px;line-height:17px;color:#666666;">
	                                                    Deze email was gestuurd naar <a href="*|EMAIL|*" style="color:#666666;">*|EMAIL|*</a>
	                                                    <br><a href="*|ABOUT_LIST|*" style="color:#666666;">waarom ontvangen</a>?   |   <a href="*|UPDATE_PROFILE|*" style="color:#666666;">voorkeur aanpassen</a>   |   <a href="*|UNSUB|*" style="color:#666666;">uitschrijven</a>
	                                                </font>
	                                                <br>
	                                                <br>
	                                                <font style="font-family:Calibri, Arial, sans-serif;font-size:13px;line-height:17px;color:#666666;">
	                                                    Vlaamse overheid · Havenlaan 88 · Brussel 1000 · België
	                                                </font>
	                                            </td>
	                                        </tr>
	                                    </table>
	                                    <!-- end footer text -->
	                                </td>
	                            </tr>
	                        </table>
	                    </td>
	                </tr>
	            </table>
	            <!-- end footer -->
	                        </td>
	                    </tr>
	                    <tr>
	                        *|REWARDS|*
	                    </tr>
	                </table>
	                <!-- end wrapper table -->
    </body>
</html>

</html>
`;
};

export async function sendCampaign(mailchimp, campaignId) {
	await mailchimp.campaigns.send(campaignId);
}

export async function createThemesCondition (mailchimp, allThemesOfNewsletter) {
  const allUniqueThemesOfNewsletter = [...new Set(allThemesOfNewsletter)];
  const interests = await fetchInterestsByCategoryIdFromLists(mailchimp, INTEREST_CATEGORY_ID);
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

export async function createKindCondition (mailchimp) {
  const interestedKinds = await fetchInterestsByCategoryIdFromLists(mailchimp, KIND_CATEGORY_ID);
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

export async function fetchInterestsByCategoryIdFromLists(mailchimp, categoryId) {
	const interestsResponse = await mailchimp.lists.listInterestCategoryInterests(LIST_ID, categoryId)

	console.log(`interests: ${interestsResponse}`);
  return interestsResponse.interests;
}

