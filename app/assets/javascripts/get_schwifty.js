GetSchwifty = function(app) {
  _App = app;
  _Observer = null;

  function dispatchEvent(ev, el, data) {
    data = data || {}
    var event = new CustomEvent('getSchwifty.' + ev, {
      detail: data,
      bubbles: true
    });
    el.dispatchEvent(event)
  }

  function replaceContent(schwiftyJobId, oldEl, response) {
    dispatchEvent('render:before', oldEl, { schwiftyJobId: schwiftyJobId, response: response });

    var newContent = document.createRange().createContextualFragment(response.body);
    var newEl = newContent.firstChild;

    if (oldEl.parentNode) {
      oldEl.parentNode.replaceChild(newContent, oldEl);
    }

    dispatchEvent('render:after', newEl, { schwiftyJobId: schwiftyJobId, html: response });
  }

  function redirectTo(schwiftyJobId, oldEl, response) {
    dispatchEvent('redirect:before', oldEl, { schwiftyJobId: schwiftyJobId, response: response });

    window.location = response.body;
  }

  return {
    stopSchwifty: function() {
      if (_Observer) {
        _Observer.disconnect();
      }
    },
    watchMeGetSchwifty: function(containerID) {
      var targetNode = document.getElementById(containerID),
          config = { attributes: false, childList: true, subtree: false };

      // Callback function to execute when mutations are observed
      var callback = function(mutationsList, observer) {
          for(var mutation of mutationsList) {
              if (mutation.type == 'childList') {
                var el = mutation.target;
                var schwiftyJobId = el.getAttribute('data-get-schwifty');
                var schwiftyParams = JSON.parse(el.getAttribute('data-get-schwifty-params')) || {};

                dispatchEvent('subscribe:before', el, { schwiftyJobId: schwiftyJobId, paschwiftyParamsrams: schwiftyParams });

                var subscription = Object.assign({ channel: "GetSchwiftyChannel", id: schwiftyJobId }, schwiftyParams);

                var cable = _App.cable.subscriptions.create(subscription, {
                  received: function(response) {

                    switch (response.status) {
                      case 302:
                      redirectTo(schwiftyJobId, el, response);
                      break;
                      default:
                      replaceContent(schwiftyJobId, el, response);
                    }

                    cable.perform('rendered');
                    cable.unsubscribe();
                  }
                });

                dispatchEvent('subscribe:after', el, { schwiftyJobId: schwiftyJobId })
              }
          }
      };

      // Create an observer instance linked to the callback function
      _Observer = new MutationObserver(callback);

      // Start observing the target node for configured mutations
      _Observer.observe(targetNode, config);
    },
    showMeWhatYouGot: function(selector) {
      selector = selector || '';

      [].forEach.call(document.querySelectorAll(selector + ' [data-get-schwifty]'), function(el) {
        var schwiftyJobId = el.getAttribute('data-get-schwifty');
        var schwiftyParams = JSON.parse(el.getAttribute('data-get-schwifty-params')) || {};

        dispatchEvent('subscribe:before', el, { schwiftyJobId: schwiftyJobId, paschwiftyParamsrams: schwiftyParams });

        var subscription = Object.assign({ channel: "GetSchwiftyChannel", id: schwiftyJobId }, schwiftyParams);

        var cable = _App.cable.subscriptions.create(subscription, {
          received: function(response) {

            switch (response.status) {
              case 302:
              redirectTo(schwiftyJobId, el, response);
              break;
              default:
              replaceContent(schwiftyJobId, el, response);
            }

            cable.perform('rendered');
            cable.unsubscribe();
          }
        });

        dispatchEvent('subscribe:after', el, { schwiftyJobId: schwiftyJobId })
      });
    }
  };
}
