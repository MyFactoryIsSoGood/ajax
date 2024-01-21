$(document).ready(function () {
  function addEditDeleteButtons(task_elem) {
    var editBtn = $("<span>")
      .addClass("edit-btn")
      .text("Редактировать")
      .on("click", function () {
        var updatedTask = prompt(
          "Редактировать задание:",
          task_elem.find("span.task-text").text()
        );
        if (updatedTask !== null) {
          task_elem.find("span.task-text").text(updatedTask);
        }
      });

    var deleteBtn = $("<span>")
      .addClass("edit-btn")
      .text("Удалить")
      .on("click", function () {
        task_elem.remove();
      });

    task_elem.append(editBtn).append(deleteBtn);
  }

  function fetchUserData(userId, callback) {
    var userUrl = "https://jsonplaceholder.typicode.com/users/" + userId;

    $.ajax({
      url: userUrl,
      method: "get",
      dataType: "json",
      success: function (user) {
        callback(user.name);
      },
      error: function () {
        callback("Unknown User");
      },
    });
  }

  function showError(message) {
    $("#userIdError").text(message);
  }

  $("#taskForm").on("submit", function (e) {
    e.preventDefault();

    var title = $("#title").val();
    var body = $("#body").val();
    var userId = $("#userId").val();

    if (userId < 1 || userId > 10 || isNaN(userId)) {
      showError("Введите корректный ID пользователя (1-10).");
      return;
    } else {
      showError("");
    }

    var task_elem = $("<div>")
      .addClass("task")
      .append('<input type="checkbox">')
      .append('<span class="task-text">' + title + "</span>")
      .append('<div class="creator"></div>');

    addEditDeleteButtons(task_elem);

    task_elem.appendTo($("#tasks"));

    $.ajax({
      url: "https://jsonplaceholder.typicode.com/todos",
      method: "post",
      dataType: "json",
      data: {
        title: title,
        body: body,
        userId: userId,
        completed: false,
      },
      success: function (response) {
        fetchUserData(userId, function (creatorName) {
          task_elem.find(".creator").text("Created by: " + creatorName);
        });

        console.log(response);
        console.log(JSON.stringify(response));
      },
    });
  });

  $("body").on("click", 'input[type="checkbox"]', function () {
    var task = $(this).parents(".task");

    if (task.hasClass("strikeout")) {
      task.removeClass("strikeout");
      task.appendTo($("#tasks"));
    } else {
      task.addClass("strikeout");
      task.appendTo($("#done"));
    }
  });

  $("#tasks, #done").on("mouseenter", ".task", function () {
    $(this).find(".edit-btn").show();
  });

  $("#tasks, #done").on("mouseleave", ".task", function () {
    $(this).find(".edit-btn").hide();
  });
  $("#toggleThemeBtn").click(function () {
    $("body").toggleClass("light-mode dark-mode");
  });
});
