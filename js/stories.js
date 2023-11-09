"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const isFavorite = currentUser ? currentUser.isFavorite(story) : false;
  const starClass = isFavorite ? "star-fav" : "star";
  const starContent = isFavorite ? "&#9733;" : "&#9734;";

  return $(`
      <li id="${story.storyId}">
        <span class="${starClass}">${starContent}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
    $favoritedStoriesList.hide();
  }

  $allStoriesList.show();
}
// ///////////////////////////////////////////////////////////////////////////
async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  // grab all info from form
  const title = $("#input-title").val();
  const url = $("#input-url").val();
  const author = $("#input-author").val();
  const username = currentUser.username
  const storyData = {title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  // hide the form and reset it
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

////////////////my code /////////////////////////////////////////////
function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");
$submitForm.hide();
  $body.find("h5").remove();
  $favoritedStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStoriesList.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStoriesList.append($story);

  }}
  $favoritedStoriesList.show();

}




async function addFavoriteStory(evt) {
  console.debug("addFavoriteStory");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // check if the story is already favorited
  if ($tgt.closest("span").hasClass("star")) {
    // add the story to the user's favorites and change the star
    await currentUser.addFavorite(story);
    $tgt.closest("span").removeClass("star").addClass("star-fav");
    $tgt.html("&#9733;");
  } else if ($tgt.closest("span").hasClass("star-fav")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("span").removeClass("star-fav").addClass("star");
    $tgt.html("&#9734;");
  }
}

$body.on("click", "span", addFavoriteStory);  
