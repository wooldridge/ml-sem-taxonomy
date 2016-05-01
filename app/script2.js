/**
 * Handle display of concepts.
 */
function dispSub(id) {
  var url, cont, ref;
  if (id) {
    url = '/narrower2?q=' + id;
    container = 'li#' + id;
    ref = 'list-' + id;
  } else {
    url = '/top2';
    container = '#nav';
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
        if (curr.numSubs.value > 0) {
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
      $('ul#' + ref + ' li label').on('click', function(event){
        $('label').removeClass('selected');
        $(this).addClass('selected');
        console.log('here');
        event.preventDefault();
        event.stopPropagation();
        var id = this.parentElement.id;
        concept(id);
      });
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
}

/**
 * Term search.
 */
function search(term) {
  event.preventDefault();
  $('#summary').html('');
  $('#results').html('');
  $('#spinner').show();
  var results = '';
  // Get search results
  $.ajax({
    method: 'GET',
    url: '/search?q=' + term
  }).done(
    function(data) {
      console.dir(data);
      $('#spinner').hide();
      $('#summary').html('Results found: ' + data.total);
      if (data.total > 0) {
        for (var res of data.results) {
          results += '<div class="result">';
          results += '<div class="result-title">';
          results += res.metadata[0].doc;
          results += '</div>';
          results += '<div class="result-uri">';
          results += res.uri;
          results += '</div>';
          results += '</div>';
        }
        $('#results').html(results);
      }
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
};

/**
 * Concept search.
 */
function concept(concept) {
  event.preventDefault();
  $('#summary').html('');
  $('#results').html('');
  $('#spinner').show();
  var results = '';
  // Get search results
  $.ajax({
    method: 'GET',
    url: '/concept?q=' + concept
  }).done(
    function(data) {
      console.dir(data);
      $('#spinner').hide();
      $('#summary').html('Results found: ' + data.length);
      if (data.length > 0) {
        for (var res of data) {
          results += '<div class="result">';
          results += '<div class="result-title">';
          results += res.content.envelope.source.doc;
          results += '</div>';
          results += '<div class="result-uri">';
          results += res.uri;
          results += '</div>';
          results += '</div>';
        }
        $('#results').html(results);
      }
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
};

$(document).ready(function() {
    concept(528);
    dispSub();
});
