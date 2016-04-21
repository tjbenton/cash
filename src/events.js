function registerEvent(node, eventName, callback) {
  var eventCache = getData(node,'_cashEvents') || setData(node, '_cashEvents', {});
  eventCache[eventName] = eventCache[eventName] || [];
  eventCache[eventName].push(callback);
  node.addEventListener(eventName, callback);
}

function removeEvent(node, eventName, callback){
  var eventCache = getData(node,'_cashEvents')[eventName];
  if (callback) {
    node.removeEventListener(eventName, callback);
  } else {
    each(eventCache, event => { node.removeEventListener(eventName, event); });
    eventCache = [];
  }
}

fn.extend({

  off(eventName, callback) {
    return this.each(v => removeEvent(v, eventName, callback) );
  },

  on(eventName, delegate, callback, runOnce) {

    var originalCallback;

    if ( !isString(eventName) ) {
      for (var key in eventName) {
        this.on(key,delegate,eventName[key]);
      }
      return this;
    }

    if ( isFunction(delegate) ) {
      callback = delegate;
      delegate = null;
    }

    if ( eventName === 'ready' ) { onReady(callback); return this; }

    if ( delegate ) {
      originalCallback = callback;
      callback = function(e) {
        var t = e.target;

        if (matches(t, delegate)) {
          originalCallback.call(t, e);
        } else {
          while (!matches(t, delegate)) {
            if (t === document.documentElement) {
              return (t = false);
            }
            t = t.parentNode;
          }

          if (t) {
            originalCallback.call(t, e);
          }
        }
      };
    }

    return this.each(v => {
      var finalCallback = callback;
      if ( runOnce ) {
        finalCallback = function(){
          callback.apply(this,arguments);
          removeEvent(v, eventName, finalCallback);
        };
      }
      registerEvent(v, eventName, finalCallback);
    });
  },

  one(eventName, delegate, callback) {
    return this.on(eventName, delegate, callback, true);
  },

  ready: onReady,

  trigger(eventName) {
    var evt = doc.createEvent('HTMLEvents');
    evt.initEvent(eventName, true, false);
    return this.each(v => v.dispatchEvent(evt));
  }

});
