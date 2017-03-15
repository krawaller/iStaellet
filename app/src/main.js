
L.mapbox.accessToken = 'pk.eyJ1IjoibGl0ZW5qYWNvYiIsImEiOiJ6TnBCVHNFIn0.ZLiQ7tN-T1Y5Jg3zsUTnqA';

var state = {
  map: L.mapbox.map('map', 'mapbox.streets', {
    fadeAnimation: false,
    attributionControl: {
      compact: true
    }
  }),
  stations: [],
  markerFeatureGroup: L.featureGroup(),
  starredFeatureGroup: L.featureGroup(),
  activePopupStationId: null,
  starredStationIds: {},
  refreshInterval: null,
  refreshIntervalDuration: 30000,
};

init()
  .then(refresh)
  .then(render)
  .then(fitBounds)
  .then(showMap)

function init() {
  if (navigator.appVersion.indexOf('Mac') != -1) {
    document.body.classList.add('mac');
  }

  state.map
    .setView([57.7088394,11.974375], 13)
    .on('popupopen', function(event) {
      state.activePopupStationId = event.popup.stationId;
    })
    .on('popupclose', function(event) {
      setTimeout(function() {
        state.activePopupStationId = null;
      }, 0);
    });

  state.markerFeatureGroup.addTo(state.map);

  try {
    state.starredStationIds = JSON.parse(localStorage.getItem('starredStationIds')) || {};
  } catch (error) {
    state.starredStationIds = {};
  }

  startRefreshInterval();

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      stopRefreshInterval();
    } else {
      refresh()
        .then(render)
        .then(fitBounds)
        .then(startRefreshInterval);
    }
  });

  if ('geolocation' in navigator) {
    L.control.locate().addTo(state.map);
  }

  try {
    var remote = require('remote');
    var Menu = remote.require('menu');
    var menu = Menu.buildFromTemplate([{
      label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:'
    }]);

    window.addEventListener('contextmenu', function (event) {
      event.preventDefault();
      menu.popup(remote.getCurrentWindow());
    }, false);
  } catch (error) {}

  return Promise.resolve();
}

function render() {
  state.markerFeatureGroup.clearLayers();
  state.starredFeatureGroup.clearLayers();

  state.stations.forEach(function(station) {
    var marker = L.marker([station.Lat, station.Long], {
      icon: new MyIcon({
        percentageFull: (station.AvailableBikes / (station.AvailableBikes + station.AvailableBikeStands)) * 100
      })
    }).addTo(state.markerFeatureGroup);

    if (state.starredStationIds[station.StationId]) {
      marker.addTo(state.starredFeatureGroup);
    } else if (Object.keys(state.starredStationIds).length) {
      marker.setOpacity(0.5);
    }

    var popup = L.popup();
    popup.stationId = station.StationId;

    var contentElement = document.createElement('div');
    contentElement.innerHTML = [
      '<h1 class="' + (state.starredStationIds[station.StationId] ? 'starred' : '') + '">' + station.Name.toLowerCase() + '</h1>',
      '<span class="bikes">' + station.AvailableBikes + '</span><span class="stands">' + station.AvailableBikeStands + '</span>',
    ].join('');

    contentElement.querySelector('h1').onclick = function() {
      if (station.StationId in state.starredStationIds) {
        delete state.starredStationIds[station.StationId];
      } else {
        state.starredStationIds[station.StationId] = true;
      }
      localStorage.setItem('starredStationIds', JSON.stringify(state.starredStationIds));
      render();
    };

    popup.setContent(contentElement);
    marker.bindPopup(popup);

    if (state.activePopupStationId == station.StationId) {
      marker.openPopup(popup);
    }
  });
}

function refresh() {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var url = 'https://data.goteborg.se/SelfServiceBicycleService/v1.0/Stations/a8fa9d1b-84f6-440b-a511-f1d906dbe779?format=json&dt=' + Date.now();
    xhr.open('GET', url);
    xhr.onload = function(event) {
      var data = JSON.parse(this.response);
      state.stations = data;
      resolve();
    };

    xhr.onerror = function(event) {
      reject(event.target);
    };
    xhr.send();
  });
}

function fitBounds() {
  var bounds = state.starredFeatureGroup.getBounds().isValid() ?
    state.starredFeatureGroup.getBounds() :
    state.markerFeatureGroup.getBounds();

  state.map.fitBounds(bounds, {
    padding: [20, 20],
    maxZoom: 16,
    animate: false
  });

  return Promise.resolve();
}

function showMap() {
  document.body.classList.add('loaded');
  setTimeout(function() {
    document.body.classList.add('after-loaded');
  }, 1000);
}

function startRefreshInterval () {
  state.refreshInterval = setInterval(function() {
    refresh().then(render);
  }, state.refreshIntervalDuration)
}

function stopRefreshInterval () {
  clearInterval(state.refreshInterval);
}

var MyIcon = L.Icon.extend({
  options: {
    className:'item',
    html:'<div class="marker"><div class="inner"></div></div>',
    iconSize: [30, 41],
    iconAnchor: [15, 41],
    popupAnchor: [0, -39],
    percentageFull: 0
  },

  createIcon: function (oldIcon) {
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
        options = this.options;

    div.innerHTML = options.html !== false ? options.html : '';
    div.querySelector('.inner').style.height = ((options.percentageFull * 0.88) + 6) + '%'
    if (options.percentageFull === 100 || options.percentageFull === 0) {
      options.className += ' full';
    } else if (options.percentageFull > 90 || options.percentageFull < 10) {
      options.className += ' warn';
    }

    this._setIconStyles(div, 'icon');
    return div;
  }
});

if (location.hostname === 'localhost') {
  var livereload = document.createElement('script');
  livereload.src = 'http://localhost:35729/livereload.js';
  document.body.appendChild(livereload);
}
