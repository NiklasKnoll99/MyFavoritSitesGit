var $searchBox = document.querySelector('#search'); // represent the search textbox
var $siteDisplay = document.querySelector('#siteDisplay'); // displays the search results
var $sendFavoritData = document.querySelector('#sendFavoritData'); // Button to send favorite site data
var $loadMore = document.querySelector('#loadMore'); // Button to load more sites

// new favorit site inputs
var $name = document.querySelector('#name');
var $fbpage = document.querySelector('#facebookpage');
var $address = document.querySelector('#address');
var $email = document.querySelector('#email');
var $comment = document.querySelector('#comment');

var siteAmount = 10; // Amount of sites to load
var skipAmount = 0; // Amount of sites to skip

chayns.ready.then(function() {
  // called if searchvalue changed
  $searchBox.addEventListener('keyup', function() {
    setTimeout(() => {
      console.log($searchBox.value); // DEBUG
      clearDisplay();
      skipAmount = 0;
    
      if ($searchBox.value != '')
        fetchSites($searchBox.value, siteAmount, skipAmount, onSuccessfulJSONLoad);
    }, 500);
  });

  $loadMore.addEventListener('click', function() {
    if (!isDisplayClear()) {
      skipAmount += 10;

      if ($searchBox.value != '')
        fetchSites($searchBox.value, siteAmount, skipAmount, onSuccessfulJSONLoad);
    }
  });

  // calls x if sendFavoritData-Button was clicked
  $sendFavoritData.addEventListener('click', sendFavorit);
});

// return whether siteDisplay is clear or not
function isDisplayClear()
{
  if ($siteDisplay.innerHTML === '')
    return true;

  else
    return false;
}

// called if a link was clicked
function onLinkClick(_url) {
  _url += '?tappId=1';
  chayns.openUrlInBrowser(_url);
}

// checks for valid inputs
function validInputs()
{
  var empty = [];
  var msg = '';

  if ($name.value === '')
    empty.push('Name');

  if ($fbpage.value === '') {
    if (empty.length > 0)
      empty.push(', Facebookseite');

    else
      empty.push('Facebookseite');
  }

  if ($address.value === '')
  {
    if (empty.length > 0)
      empty.push(', Adresse');

    else
      empty.push('Adresse');
  }

  if (empty.length > 1) {
    msg = 'Die Felder ';

    for (var i = 0; i < empty.length; i++)
    {
      msg += empty[i];
    }

    msg += ' dürfen nicht leer sein!';
    chayns.dialog.alert('', msg);

    return false;
  }

  else if (empty.length == 1)
  {
    msg = 'Das Feld ' + empty[0] + ' darf nicht leer sein!';
    chayns.dialog.alert('', msg);

    return false;
  }

  else
    return true;
}

// clears the display
function clearDisplay()
{
  $siteDisplay.innerHTML = "";
}

// return usable url
function getSiteIconUrl(siteId)
{
  return 'https://sub60.tobit.com/l/' + siteId + '?size=45';
}

// called if the sendFavoritData-Button was pressed
function sendFavorit()
{
  if (validInputs()) {
    chayns.intercom.sendMessageToPage({ 
    text: 'Du hast eine neue Site hinzugefügt!\n\nName:\n' + $name.value + '\n\nFacebookseite:\n' + $fbpage.value + '\n\nAdresse:\n' + $address.value + '\n\nE-Mail:\n' + $email.value + '\n\nKommentar:\n' + $comment.value
    }).then(function(data) {            
      if(data.status == 200)
        chayns.dialog.alert('','Vielen Dank!');
    });
  }
}

// called if JSON loaded successful
function onSuccessfulJSONLoad(jsonData, skipped)
{
  if (skipped === 0)
    clearDisplay();

  // display 10 of x sites
  for (var i = 0; i < siteAmount; i++)
  {
    // if i = 1, then margin-top = -1 to avoid thick lines
    if ((i >= 1) || (skipAmount > 0))
      createListItem(jsonData[i].appstoreName, jsonData[i].siteId, getSiteIconUrl(jsonData[i].siteId), 'https://chayns.net/' + jsonData[i].siteId + '/', true);

    else
      createListItem(jsonData[i].appstoreName, jsonData[i].siteId, getSiteIconUrl(jsonData[i].siteId), 'https://chayns.net/' + jsonData[i].siteId + '/', false);

    console.log(jsonData[i].siteId + ' ' + jsonData[i].facebookId + ' ' + jsonData[i].locationId + ' ' + jsonData[i].appstoreName); // DEBUG
  }
}

function createListItem(heading, description, icon, url, needmrgn)
{
  // first line
  var $line = document.createElement('div');
  $line.setAttribute('style', 'height: 1px; background-color: #335360');

  // second line
  var $line2 = document.createElement('div');
  $line2.setAttribute('style', 'height: 1px; background-color: #335360');

  // site icon
  var $icon = document.createElement('div');
  $icon.setAttribute('style', 'width: 45px; height: 45px; background-image: url(' + icon + '); background-size: cover');

  // description
  var $description = document.createElement('p');
  $description.innerHTML = description;
  $description.setAttribute('style', 'line-height: 0.9em; font-size: 85%');

  // heading
  var $heading = document.createElement('h4');
  $heading.setAttribute('style', 'line-height: 1em');
  $heading.innerHTML = heading;

  // div which contains heading and description
  var $textContent = document.createElement('div');
  $textContent.setAttribute('style', 'padding-left: 8px');
  $textContent.appendChild($heading);
  $textContent.appendChild($description);

  // div which contains icon and textcontent
  var $itemContent = document.createElement('div');
  $itemContent.setAttribute('style', 'display: flex; align-items: center; padding: 8px 0px 8px 10px');
  $itemContent.appendChild($icon);
  $itemContent.appendChild($textContent);

  // Link to the site
  var $link = document.createElement('a');
  $link.setAttribute('href', '#');
  $link.appendChild($line);
  $link.appendChild($itemContent);
  $link.appendChild($line2);

  $link.addEventListener('click', function() {
    onLinkClick(url);
  });

  // represents full ListItem
  var $siteItem = document.createElement('div');
  $siteItem.setAttribute('class', 'item');
  $siteItem.appendChild($link);
  
  if (needmrgn) {
    $siteItem.setAttribute('style', 'margin-top: -1px');
  }

  $siteDisplay.appendChild($siteItem);
}

// loads [amount] sites which name contains [search]
function fetchSites(search, amount, skip, onSuccess) {
  var url = 'https://chayns1.tobit.com/TappApi/Site/SlitteApp?SearchString=' + search + '&Skip=' + skip + '&Take=' + amount;
  fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    onSuccess(myJson.Data, skip);
    console.log(url); // DEBUG
  });
}