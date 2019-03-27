//Function to shorten the article title
function titleShortener(title) {
    if (title.length < 42) {
        return title;
    }
    else {
        return title.substring(0,42) + "...";
    }
}

// Function to populate the modal with comments
function modalPopulator(id) {
    $.get("/comments/" + id, function(data){
        console.log("Comments for this article: ", data);
        $(".modal-card-title").text(titleShortener(data.title));
        $(".submit-comment").attr("data-id", id);
        $("#existing-comments").html("None");
        if (data.comments.length > 0) { $("#existing-comments").html("") };
        for (var i = 0; i < data.comments.length; i++) {
            $("#existing-comments").prepend("<article class='message is-info'><div class='message-body'>" + data.comments[i].body + " (by " + data.comments[i].name + ")<br><br><a class='button is-danger delete-comment' comment-id='" + data.comments[i]._id + "' article-id='" + id + "'>Delete this comment</a></div></article>");
        };
    });
}

// Open the modal to show comments
$(document).on("click", ".modal-opener", function(){
    var clickedID = $(this).attr("data-id");
    console.log("Clicked ID: ", clickedID);
    modalPopulator(clickedID);
    $(".modal").addClass("is-active");
});

// Close and clear the modal
$(document).on("click", ".close-modal", function() {
    $(".modal").removeClass("is-active");
});

// Submit a new comment
$(document).on("click", ".submit-comment", function() {
    event.preventDefault();
    var submitID = $(this).attr("data-id");
    var userName = $("#user-name").val().trim();
    var userComment = $("#user-comment").val().trim();
    if (userName == "" || userComment == "") {
        $("#confirmation-message").text("Please fill out both the fields above to leave a comment");
        setTimeout(function(){ $("#confirmation-message").text(""); }, 5000);
    }
    else {
        $.ajax({
            url: "/submitcomment/" + submitID,
            type: "post",
            data: {"name": userName, "body": userComment}
        }).done(function(response){
            console.log("DB updated with new comment: ", response);
            modalPopulator(submitID);
            $("#user-name").val("");
            $("#user-comment").val("");
            $("#confirmation-message").text("Your comment has been successfully posted! (See below)");
            setTimeout(function(){ $("#confirmation-message").text(""); }, 5000);
        }).fail(function(error){
            console.log(error);
        });
    }
});

// Delete a comment
$(document).on("click", ".delete-comment", function() {
    var clickedCommentID = $(this).attr("comment-id");
    var currentArticleID = $(this).attr("article-id");
    console.log("Deleting comment ", clickedCommentID);
    $.get("/deletecomment/" + clickedCommentID, function(data) {
        console.log("Response after deleting comment: ", data);
        modalPopulator(currentArticleID);
    });
});