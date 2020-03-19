// Client ID and API key from the Developer Console
var CLIENT_ID = '74470702143-eer1b5ra7ifahjp6ijbp9klu01il7f65.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBtXxYqZg_aL7kUHQJ1yIefBYvKNBNosnU';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/gmail.modify'; 

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

var FromList = {};
var labelNames = {};
var idList = {};
var CollegeID = "";
var SavedID = {};
var College = false;
var x = 0;


var searchTerm = 'from:.edu';


// Main function that we are adding
function main() {
  listLabels();
  // college_label();
  console.log(listMessages('me', searchTerm));
  // console.log(labelNames);
  window.CollegeID = window.labelNames.College;
  createLabel('College');
  college_label();
}


/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    main();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listLabels() {
  gapi.client.gmail.users.labels.list({
    'userId': 'me'
  }).then(function(response) {
    var labels = response.result.labels;
    // appendPre('Labels:');

    if (labels && labels.length > 0) {
      for (i = 0; i < labels.length; i++) {
        var label = labels[i];
        labelNames[label.name] = label.id;
        // appendPre(label.name);
      }
    } else {
      appendPre('No Labels found.');
    }
  });
  return labelNames;
}
/* 
function changeLabel(result) {
    for (var i = 0; i < result.length; i++) {
      modifyMessage('me', result[i]['id'], )
    }
}
*/
  /**
* Retrieve Messages in user's mailbox matching query.
*
* @param  {String} userId User's email address. The special value 'me'
* can be used to indicate the authenticated user.
* @param  {String} query String used to filter the Messages listed.
* @param  {Function} callback Function to call when the request is complete.
*/
function listMessages(userId, query) {
  var getPageOfMessages = function(request, result) {
      request.execute(function(resp) {
      result = result.concat(resp.messages);
      
      var nextPageToken = resp.nextPageToken;
      if (nextPageToken) {
          request = gapi.client.gmail.users.messages.list({
          'userId': userId,
          'pageToken': nextPageToken,
          'q': query
          });
          getPageOfMessages(request, result);
      
      } else {
          console.log('out of messages')
          logResult(result);
      }
      });
  };
  var initialRequest = gapi.client.gmail.users.messages.list({
      'userId': userId,
      'q': query
  });
  getPageOfMessages(initialRequest, []);
}

function logResult(result) {
  console.log(labelNames['College']);
  window.CollegeID = labelNames['College'];
  console.log(CollegeID)
  // console.log(result);
  console.log(result['length']);
  idList = result
  console.log(idList)
  modifier();
}

function modifier(){
  try{
    modifyMessage('me', idList[x]['id'], labelNames['College']);
    x+=1;
    if(x < idList['length']) {
      setTimeout(modifier, 20);
      console.log(x + ' Did Work')
    } else {
      console.log('Done');
    }
  } catch {
    x-=1;
    // setTimeout(modifier,20)
    console.log(x + ' Did not work')
  }


  // for (var i = 0; i < idList['length']; i++) {
  //   setTimeout(console.log('Hello'), 1000)
    // setTimeout(modifyMessage('me', result[i]['id'], labelNames['College']), 20);
  // }
}
/**
* Modify the Labels a Message is associated with.
*
* @param  {String} userId User's email address. The special value 'me'
* can be used to indicate the authenticated user.
* @param  {String} messageId ID of Message to modify.
* @param  {Array} labelsToAdd Array of Labels to add.
* @param  {Array} labelsToRemove Array of Labels to remove.
* @param  {Function} callback Function to call when the request is complete.
*/
function modifyMessage(userId, messageId, labelsToAdd) {
  var request = gapi.client.gmail.users.messages.modify({
    'userId': userId,
    'id': messageId,
    'addLabelIds': labelsToAdd,
    //'removeLabelIds': labelsToRemove
  });
  var cache = request.execute();
  console.log(typeof cache); // You might have to comment this out, we are figuring it out
}

/**
 * Add a new Label to user's mailbox.
 *
 * 
 */
function createLabel(newLabelName) {
  var request = gapi.client.gmail.users.labels.create({
    'userId': 'me',
    'resource': {
      'name': newLabelName,
      'labelListVisibility': 'labelShow',
      'messageListVisibility': 'show',
    }
  });
  listLabels();
  request.execute();
}

function cb() {
    console.log('callback worked');
}

function college_label() {
  var labelArray = listLabels();
  CollegeID = labelArray['College']
  console.log(labelArray);
  var keys = Object.keys(labelArray)
  console.log(keys)
  //console.log(keys)
  
  try {
    window.CollegeID = labels['College'];
    console.log('Label Exists');
    console.log(window.CollegeID)
  } catch {
    createLabel('College');
    console.log('Label Created');
    // college_label();
  }
  
  
  
  // for(var key in labelArray) {
  //   console.log('hello');
  //   console.log(key);
  //   if (key == "College") {
  //     window.College = true;
  //     CollegeID = labelArray[key];
  //     console.log('found a label named college');
  //     break;
  //   }
  // }

  // if (window.College == false) {
  //   createLabel("me","College");
  //   console.log("Lable Created");
  //   // college_label();
  // } else {
  //   console.log("Label Exists");
  // }

}