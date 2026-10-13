// Guilloche security-print patterns, stamp impressions and the mock offer form.
(function () {
  document.documentElement.classList.add('js');
  var NS = 'http://www.w3.org/2000/svg';

  function path(d) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    return p;
  }

  // Closed rosette curve: radius modulated by two harmonics, rotated per layer.
  function rosette(R, a, n, b, m, phase, steps) {
    var d = '';
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * Math.PI * 2;
      var r = R + a * Math.sin(n * t + phase) + b * Math.cos(m * t - phase * 2);
      var x = r * Math.cos(t), y = r * Math.sin(t);
      d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    return d + 'Z';
  }

  var builders = {
    rosette: function (g) {
      for (var k = 0; k < 36; k++) g.appendChild(path(rosette(205, 48, 18, 14, 7, k * 0.175, 900)));
      for (k = 0; k < 24; k++) g.appendChild(path(rosette(118, 22, 12, 8, 5, k * 0.26, 600)));
      for (k = 0; k < 14; k++) g.appendChild(path(rosette(268, 10, 30, 6, 15, k * 0.21, 1200)));
    },
    'rosette-small': function (g) {
      for (var k = 0; k < 28; k++) g.appendChild(path(rosette(200, 40, 16, 12, 8, k * 0.22, 800)));
    },
    seal: function (g) {
      g.setAttribute('transform', 'translate(24 24)');
      for (var k = 0; k < 10; k++) g.appendChild(path(rosette(13, 2.4, 10, 1, 5, k * 0.6, 240)));
    },
    waves: function (g) {
      for (var k = 0; k < 26; k++) {
        var d = '', y0 = 40 + k * 13;
        for (var x = 0; x <= 1200; x += 6) {
          var y = y0 + 22 * Math.sin(x / 95 + k * 0.32) + 9 * Math.sin(x / 31 - k * 0.5);
          d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
        }
        g.appendChild(path(d));
      }
    }
  };

  document.querySelectorAll('[data-guilloche]').forEach(function (g) {
    var build = builders[g.getAttribute('data-guilloche')];
    if (build) build(g);
  });

  // Signature moment: destination stamps impress once when the visa pages enter.
  var visas = document.querySelectorAll('.visa');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-stamped'); io.unobserve(e.target); }
      });
    }, { threshold: 0.45 });
    visas.forEach(function (v) { io.observe(v); });
  } else {
    visas.forEach(function (v) { v.classList.add('is-stamped'); });
  }

  // Mockup form: validates, never sends data anywhere.
  var form = document.querySelector('.offer');
  if (form) {
    var msg = form.querySelector('textarea');
    var hints = { candidat: 'Ce post cauți și în ce țară?', angajator: 'De câți oameni aveți nevoie și pentru ce post?' };
    function setWho(who) {
      var radio = form.querySelector('input[name="who"][value="' + who + '"]');
      if (radio) radio.checked = true;
      msg.placeholder = hints[who];
    }
    form.querySelectorAll('input[name="who"]').forEach(function (r) {
      r.addEventListener('change', function () { setWho(r.value); });
    });
    document.querySelectorAll('[data-who]').forEach(function (el) {
      el.addEventListener('click', function () { setWho(el.getAttribute('data-who')); });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var status = form.querySelector('.offer__status');
      var missing = [];
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim();
        f.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) missing.push(f.closest('label').querySelector('span').textContent.toLowerCase());
      });
      status.classList.toggle('is-error', missing.length > 0);
      status.textContent = missing.length
        ? 'Completați ' + missing.join(' și ') + ', ca să vă putem suna înapoi.'
        : 'Machetă: formularul nu trimite încă date. Pe site-ul real, cererea ajunge la info@chematiccompany.pro.';
    });
  }
})();
