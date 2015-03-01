//Tumblr mailer using ejs templates

var fs = require('fs');
var ejs = require('ejs');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email1_template.html', 'utf8');
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
 //Keys removed
});

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(//Keys removed);

//Parse function that returns an array of each contact as an object
function csvParse(csvFile){
    var arrayOfContacts = [];
    var arr = csvFile.split("\n");
    var contactObj;

    //Uses the "header" of csv file to obtain keys for our objects
    var keys = arr.shift().split(",");

    arr.forEach(function(contact){
        contact = contact.split(",");
        contactObj = {};

        for(var i =0; i < contact.length; i++){
            contactObj[keys[i]] = contact[i];
        }

  	     arrayOfContacts.push(contactObj);
    })

    return arrayOfContacts;
};

//Searches for tumblr posts published in the last seven days & sends an email to each contact
client.posts('sonitre.tumblr.com', function(err, blog){
	//Converts current date into a UNIX timestamp
  var currentDate = Math.round((new Date()).getTime()/1000);
	var latestPosts = [];

		blog.posts.forEach(function(post){
				//Checks if time elapsed is less than or equal to seven days
				//in units of seconds
				if((currentDate - post.timestamp) <= 604800){
					latestPosts.push(post);
				}
		});

		var friendList = csvParse(csvFile);

			friendList.forEach(function(row){
			firstName = row['firstName'];
			numMonthsSinceContact = row['numMonthsSinceContact'];
			temp = emailTemplate;

			//Renders a customized template for each contact
			var customized = ejs.render(temp, {
				firstName: firstName,
				numMonthsSinceContact: numMonthsSinceContact,
				latestPosts: latestPosts
			});

			sendEmail(firstName, row["emailAddress"], "Sonia", "soniatrehan6@gmail.com", "testing", customized);
		});
});


 function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    })
  };














