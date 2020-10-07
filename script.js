const apiKey = "a646f545e8cb9250179e0c2cd1a2515f"

$(document).ready(function () {
  $("#search-button").on("click", function () {
    let searchValue = $("#search-value").val();

    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "p", function () {
    searchWeather($(this).text());
  });

  function newRow(text) {
    let item = $("<p>").addClass("list-group-item list-group-item-action text-center").attr("style","background-color: rgb(150,150,150)").text(text);
    $(".history").append(item);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=" + apiKey + "&units=imperial",
      // dataType: "json",
    }).then(function (data) {
      if (history.indexOf(searchValue) === -1) {
        history.push(searchValue);
        window.localStorage.setItem("history", JSON.stringify(history));

        newRow(searchValue);
      }

      $("#today").empty();

      let city = $("<h1>").addClass("card-title").text(data.name);
      let wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
      let humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
      let temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
      $("#today").append(city, temp, humid, wind);

      getForecast(searchValue);
      getUVIndex(data.coord.lat, data.coord.lon);
    }
    )
  }

  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=" + apiKey + "&units=imperial",
      // dataType: "json",
    }).then(function (data) {
      $("#forecast").html("").append("<div class=\"row\">");

      console.log(data)

      for (let i = 0; i < data.list.length; i++) {
        if (data.list[i].dt_txt.indexOf("12:00:00") !== -1) {

          let tempRawF = data.list[i].main.temp_max
          let tempF = Math.trunc(tempRawF)
          let tempRawC = (tempF - 32) * (.555)
          let tempC = Math.trunc(tempRawC)

          let col = $("<div>").addClass("col-md");
          let card = $("<div>").addClass("card bg-dark text-white");
          let body = $("<div>").addClass("card-body p-2");
          let city = $("<p>").addClass("card-title").text("Date: " + new Date(data.list[i].dt_txt).toLocaleDateString());
          let pageTempF = $("<p>").addClass("card-text").text("Temperature (F): " + tempF);
          let pageTempC = $("<p>").addClass("card-text").text("Temperature (C): " + tempC);
          let humd = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

          col.append(card.append(body.append(city, pageTempF, pageTempC, humd)));
          $("#forecast .row").append(col);
        }
      }
    }
    )
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function (data) {
        let uvCard = $("<p>").text("UV Index: ");
        let btn = $("<span>").addClass("btn btn-sm").text(data.value);

        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }

        $("#today .card-body").append(uvCard.append(btn));
      }
    });
  }

  let history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (let i = 0; i < history.length; i++) {
    newRow(history[i]);
  }
});
