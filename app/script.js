/**
 * Handle display of concepts.
 */
function dispSub(id) {
  var url, cont, ref;
  if (id) {
    url = '/narrower?q=' + id;
    container = 'li#' + id;
    ref = 'list-' + id;
  } else {
    url = '/top';
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
            html += '<label class="concept">';
            html += curr.label.value;
            if (curr.num.value > 0) {
              html += ' (' + curr.num.value + ')';
            }
            html += '</label>';
            html += '</li>';
        $('ul#' + ref).append(html);
        if (curr.num.value > 0) {
          $('li#' + last).addClass('closed');
        } else {
          $('li#' + last).addClass('empty');
        }
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

$(document).ready(function() {
    dispSub();
});
