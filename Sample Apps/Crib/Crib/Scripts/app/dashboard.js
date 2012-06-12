(function() {
  var Bench, BenchView, Consultant, ConsultantView, EditConsultantModal, ExtendConsultantModal, RollOffs, RollOffsView, app;

  app = this;

  this.dashboard = {
    init: function() {
      this.rollOffs = new RollOffsView();
      this.bench = new BenchView();
      ExtendConsultantModal.render();
      return EditConsultantModal.render();
    }
  };

  BenchView = Backbone.View.extend({
    el: "#bench",
    initialize: function() {
      this.bench = new Bench();
      this.bench.bind('reset', this.render, this);
      return this.refresh();
    },
    refresh: function() {
      return this.bench.fetch();
    },
    render: function() {
      var consultantContainer,
        _this = this;
      $(this.el).empty();
      consultantContainer = $("<ul></ul>").addClass("thumbnails").css({
        'margin-top': '10px'
      });
      $(this.el).append(consultantContainer);
      return this.bench.each(function(consultant) {
        var view;
        view = new ConsultantView({
          model: consultant,
          editor: EditConsultantModal
        });
        return consultantContainer.append($("<li></li>").append(view.render().el));
      });
    }
  });

  RollOffsView = Backbone.View.extend({
    el: "#roll_offs",
    initialize: function() {
      this.rollOffs = new RollOffs();
      this.rollOffs.bind('reset', this.render, this);
      this.rollOffs.bind('change', this.render, this);
      return this.refresh();
    },
    refresh: function() {
      return this.rollOffs.fetch();
    },
    render: function() {
      var consultantContainer, monthSeperator,
        _this = this;
      $(this.el).empty();
      monthSeperator = -1;
      consultantContainer = null;
      return this.rollOffs.each(function(consultant) {
        var currentMonth, view;
        view = new ConsultantView({
          model: consultant,
          editor: EditConsultantModal,
          extendEditor: ExtendConsultantModal
        });
        currentMonth = consultant.rollOffMonth();
        if (monthSeperator !== currentMonth) {
          monthSeperator = currentMonth;
          _this.createSeperator(consultant.rollOffMonthName(), consultant.rollOffYear());
          consultantContainer = $("<ul></ul>").addClass("thumbnails").css({
            'margin-top': '10px'
          });
          $(_this.el).append(consultantContainer);
        }
        return consultantContainer.append($("<li></li>").append(view.render().el));
      });
    },
    createSeperator: function(monthName, year) {
      $(this.el).append("<hr/>");
      return $(this.el).append("<h3>" + monthName + " " + (1900 + year) + "</h3>");
    }
  });

  ConsultantView = Backbone.View.extend({
    events: {
      "click .edit": "edit",
      "click .extend": "extendConsultant"
    },
    render: function() {
      if (!this.model.onBench()) {
        $(this.el).append($.tmpl(this.engageConsultant, {
          name: this.model.name()
        }));
      }
      if (this.model.onBench()) {
        $(this.el).append($.tmpl(this.benchConsultant, {
          name: this.model.name()
        }));
      }
      return this;
    },
    edit: function() {
      return this.options.editor.edit(this.model);
    },
    extendConsultant: function() {
      return this.options.extendEditor.edit(this.model);
    },
    engageConsultant: '\
    <a href="#" class="thumbnail">\
      <img src="http://placehold.it/130x90" alt="">\
    </a>\
    <div class="well" style="margin: 3px; padding: 3px; width: 130px">\
        <div class="btn-group">\
          <a class="btn dropdown-toggle" style="width: 110px" data-toggle="dropdown" href="#">\
            Options\
            <span class="caret"></span>\
          </a>\
          <ul class="dropdown-menu">\
            <li><a href="javascript:;" class="extend">consultant has been extended</li>\
            <li><a href="javascript:;" class="edit">edit</a></li>\
          </ul>\
        </div>\
        <h4 style="margin: 5px">${name}</h4>\
    </div>\
    ',
    benchConsultant: '\
    <a href="#" class="thumbnail">\
      <img src="http://placehold.it/130x90" alt="">\
    </a>\
    <div class="well" style="margin: 3px; padding: 3px; width: 130px">\
        <div class="btn-group">\
          <a class="btn dropdown-toggle" style="width: 110px" data-toggle="dropdown" href="#">\
            Options\
            <span class="caret"></span>\
          </a>\
          <ul class="dropdown-menu">\
            <li><a href="javascript:;" class="edit">edit</a></li>\
          </ul>\
        </div>\
        <h4 style="margin: 5px">${name}</h4>\
    </div>\
    '
  });

  Consultant = Backbone.Model.extend({
    monthName: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    name: function() {
      return this.get("Name");
    },
    rollOffDate: function() {
      if (this.get("RollOffDate")) {
        return new Date(this.get("RollOffDate"));
      } else {
        return null;
      }
    },
    rollOffMonth: function() {
      return this.rollOffDate().getMonth();
    },
    rollOffMonthName: function() {
      return this.monthName[this.rollOffMonth()];
    },
    rollOffYear: function() {
      return this.rollOffDate().getYear();
    },
    onBench: function() {
      return this.get("OnBench");
    },
    extendTil: function(date) {
      var _this = this;
      console.log(date);
      return $.post("/rolloffs/extensions", {
        consultantId: this.get("Id"),
        til: date
      }, function() {
        app.dashboard.rollOffs.refresh();
        return app.dashboard.bench.refresh();
      });
    }
  });

  RollOffs = Backbone.Collection.extend({
    model: Consultant,
    url: "rolloffs/list"
  });

  Bench = Backbone.Collection.extend({
    model: Consultant,
    url: "rolloffs/bench"
  });

  EditConsultantModal = new (Backbone.View.extend({
    render: function() {
      var d, date, formatted, month, year;
      this.el = "#editConsultantModal";
      $(this.el).find("#rollOffDate").datepicker();
      d = new Date();
      date = d.getDate();
      month = d.getMonth() + 1;
      year = d.getFullYear();
      formatted = month + "/" + date + "/" + year;
      $(this.el).find("#updateConsultant").click(function() {
        return $(this.el).modal('hide');
      });
      return $(this.el).modal({
        show: false
      });
    },
    edit: function(consultant) {
      var d, date, formatted, month, year;
      this.model = consultant;
      $("#consultantName").val(consultant.name());
      if (consultant.rollOffDate()) {
        d = consultant.rollOffDate();
        date = d.getDate();
        month = d.getMonth() + 1;
        year = d.getFullYear();
        formatted = month + "/" + date + "/" + year;
        $("#rollOffDate").val(formatted);
      }
      return $(this.el).modal('show');
    }
  }));

  ExtendConsultantModal = new (Backbone.View.extend({
    save: function() {
      return this.model.extendTil($("#extensionDate").val());
    },
    render: function() {
      var _this = this;
      this.el = "#extendConsultantModal";
      $(this.el).modal({
        show: false
      });
      $(this.el).find("#extendConsultant").click(function() {
        return _this.save();
      });
      return $(this.el).find("#extensionDate").datepicker();
    },
    edit: function(consultant) {
      this.model = consultant;
      $(this.el).find(".consultantName").html(this.model.name());
      return $(this.el).modal('show');
    }
  }));

}).call(this);
