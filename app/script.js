/**
 * Handle display of concepts.
 */
function dispSub(id) {
  console.dir(id);
  var url, cont, ref;
  if (id) {
    url = 'http://localhost:8563/narrower?q=' + id;
    container = 'li#' + id;
    ref = 'list-' + id;
  } else {
    url = 'http://localhost:8563/top';
    container = '#container';
    ref = 'list-top';
  }
  $.ajax({
    method: 'GET',
    url: url,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).done(
    function(data) {
      data = JSON.parse(data);
      if ($(container + ' ul').length) {
        //$(container + ' ul#' + ref).toggle();
        $(container + ' ul').toggle();
        $(container + ' ul').toggleClass('closed');
        return;
      }
      if (data.results.bindings.length === 0) {
        return;
      }
      $(container).append('<ul id="' + ref + '"></ul>');
      data.results.bindings.forEach(function (curr) {
        var parts = curr.concept.value.split("/");
        var last = parts.pop();
        var html  = '<li id="' + last + '">';
            html += '<label class="concept">' + curr.label.value + '</label>';
            html += '</li>';
        $('ul#' + ref).append(html);
        dispNum(last);
      });
      $('ul#' + ref + ' li').on('click', function(event){
        $(this).toggleClass('closed');
        event.preventDefault();
        event.stopPropagation();
        var id = this.id;
        dispSub(id);
      });
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
}

/**
 * Handle display of numbers.
 */
function dispNum(id) {
  var url, cont, ref;
  url = 'http://localhost:8563/number?q=' + id;
  $.ajax({
    method: 'GET',
    url: url,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).done(
    function(data) {
      console.log(id);
      console.dir(data);
      var data = JSON.parse(data);
      var num = data.results.bindings[0].number.value;
      if (num > 0) {
        $('li#' + id + ' label').append(
          ' (' + num + ')'
        );
        $('li#' + id).addClass('closed');
      } else {
        $('li#' + id).addClass('empty');
      }
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
}

$(document).ready(function() {
    dispSub();
});
