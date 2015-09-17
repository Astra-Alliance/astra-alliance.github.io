$(function() {
	// test change
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
	var weekdays   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
	var today  = new Date();
	var months = [];
	var root = $(".page")[0];
	var dataCount = 0;
	var dataCurrent = 0;
	var allEventData = null;
	
	function cacheThenGenerateCalendar (eventData) {
		
		if (!allEventData) {
			allEventData = eventData;
		} else {
			allEventData = allEventData.concat(eventData);
		}
		
		dataCurrent += 1;
		if (dataCurrent == dataCount){
			generateCalendar(allEventData);
		}
		
	}
	
	function generateCalendar (eventData) {
	  
	  eventData = eventData.sort(function(a, b) { return (new Date(a.startdate)) - (new Date(b.startdate));});
	  generateAllTheMonths(eventData);
	  eventData.forEach(function (event, index) {
		appendEvent(event, index);
	  });

	  // Highlight today
	  $('#' + formattedDate(today)).removeClass('no-event').addClass('today');
	  addMonthMenu();
	}

	function addMonthMenu() {
	  $('<div id="cal-controls">').prependTo(root);
	  $('.month-table').each(function(_, table) {
		var month = $(table).data('month');
		var monthDisplay = month.split("-")[1] + ", " + month.split("-")[0];
		$('#cal-controls').append('<a class="month-menuitem" data-target="' + month + '" href="#' + month + '">' + monthDisplay + '</a>');
	  });

	  $(document).on('click', '.month-menuitem', function(e) {
		$('[data-month]').hide();
		$('[data-month="' + $(this).data('target') + '"]').show();
		$(this).addClass('active').siblings().removeClass('active');
		e.preventDefault();
	  });

	  // Get current month and click it
	  var currentMonth = $('[data-target=' + (new Date()).getFullYear() + "-"  + monthNames[(new Date()).getMonth()] + ']');
	  if( currentMonth.length ) {
		currentMonth.click();
	  } else {
		$('[data-target]').first().click();
	  }
	}

	function appendEvent(event, index) {
	  var eventStartDate = new Date(event.startdate);
	  var eventEndDate   = new Date(event.enddate);
	  var eventElement   = $('<div class="event"><a href="#">' + event.name + '</a></div>');

	  if (event.details) {
		  var eventDetails = $('<div/>', {
			id: "session_" + index,
			class: 'event-details'
		  }).appendTo(eventElement);
		  $('<div/>', {
			  class: "date",
			  text: eventStartDate.toDateString()
		  }).appendTo(eventDetails);

		  var lines = event.details.split("|");
		  for (var i = 0; i < lines.length; ++i) {
			  $('<div/>', {
				html: lines[i]
			  }).appendTo(eventDetails);
		  }
		  if (event.location) $('<div/>', {
			  class: "location",
			  text: event.location
		  }).appendTo(eventDetails);
		  eventElement.addClass("session_" + index + "_open");
		  if (event.link) $('<a target="_blank" href="' + event.link + '">Details</a>').appendTo(eventDetails);
	  }

	  // Handle multi-days
	  if ( eventEndDate.getDate() ) {
		var date         = eventStartDate;
		var spacerNumber = $('#' + formattedDate(eventStartDate)).find('.event').length;
		eventElement.addClass('multi-days');

		while ( eventEndDate > date ) {
		  // If reached end of month, go to first day of the next month
		  // Else go to the next day
		  if (date == new Date(date.getFullYear(), date.getMonth() + 1, 0)) {
			date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
		  } else {
			date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 );
		  }

		  // Add spacer to line up the event
		  var dateElement = $('#' + formattedDate(date));
		  var steps = dateElement.find('.event').length;
		  loopForTimes( spacerNumber - steps, function() {
			dateElement.append('<div class="event spacer">&nbsp;</div>');
		  });

		  dateElement.removeClass('no-event').append('<div class="event multi-days following-days" title="' + event.name + '"><a target="_blank" href="' + event.tickets + '">' + event.name + '</a></div>');
		}
	  }

	  $('#' + formattedDate(eventStartDate)).removeClass('no-event').append(eventElement);
	  if (event.details) $("#session_" + index).popup({transition: 'all 0.3s'});
	}

	function generateAllTheMonths(eventData) {
	  var dates = [];
	  var months = [];

	  eventData.forEach(function(event) {
		if (event.startdate) dates.push(event.startdate);
		if (event.enddate) dates.push(event.enddate);
	  });

	  dates.forEach(function (date) {
		date = new Date(date);
		if(months.indexOf(date.getFullYear().toString() + date.getMonth()) < 0) {
		  months.push(date.getFullYear().toString() + date.getMonth());
		  generateMonthTable(date);
		} else {
		}
	  });
	}

	function generateMonthTable(date) {
	  var eventMonthName = monthNames[date.getMonth()];
	  var monthTable     = $('<div class="month-table" data-month="' + date.getFullYear() + "-"  + eventMonthName + '" id="month-' + date.getMonth() + '"></div>');
	  // $("<div/>", {class: "etc", id: "etcetc"}) ?
	  var monthTableBody = $("<div/>", {class: "month-table-body"});
	  monthTableBody.appendTo(monthTable);
	  // var today          = new Date()
	  var endOfToday     = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
	  var firstDay       = new Date(date.getFullYear(), date.getMonth(), 1);
	  var numberOfDays   = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
	  var weekDayNumber  = firstDay.getDay();

	  monthTable.appendTo(root);
	  //monthTable.before('<h2 data-month="' + date.getFullYear() + '-' + eventMonthName + '">' + eventMonthName + ' ' + date.getFullYear() + '</h2>');

	  // Add month calendar header
	  monthTableBody.append('<div class="header month-table-tr"></div>');
	  var headerRow = monthTableBody.find('.header');
	  loopForTimes( 7, function(i) {
		headerRow.append('<div class="month-table-td"><h2>' + weekdays[i] + '</h2></div>');
	  });

	  // Add empty days from previous month
	  var times = weekDayNumber === 0 ? 6 : weekDayNumber - 1;
	  loopForTimes( times, function() {
		getFirstAvailableRow(monthTableBody).append('<div class="empty month-table-td"></div>');
	  });

	  // Filling the month with days
	  loopForTimes( numberOfDays, function(daynumber) {
		var thisDay = new Date(date.getFullYear(), date.getMonth(), (daynumber + 1));
		var id = formattedDate(thisDay);
		var pastClass = endOfToday > thisDay ? " past" : "";
		getFirstAvailableRow(monthTableBody).append('<div class="month-table-td no-event' + pastClass + '" id=' + id + '><div class=day>'+ (daynumber + 1) +'</div></div>');
	  });

	  // Add empty days from next month
	  var lastRow = monthTableBody.find('.month-table-tr:last');
	  var cellsInLastRow = lastRow.find('.month-table-td').length;
	  // Check if this is necessary
	  if ( cellsInLastRow < 7 ) {
		loopForTimes( (7 - cellsInLastRow), function() {
		  lastRow.append('<div class="empty month-table-td"></div>');
		});
	  }
	}

	// Because I don't like to write for()
	function loopForTimes( times, callback ) {
	  for( var i=0; i < times; i++ ){
		callback(i);
	  }
	}

	/*
	  what about...

	  for (i in object) {}

	  or, with jQuery...

	  $.each(object, function(i, val) {});

	  ?
	*/

	// This is handy: getting the first row with available cell space
	function getFirstAvailableRow( table ) {
	  var row = table.find('.month-table-tr.days').filter(function(i, thisRow) {
		return ($(thisRow).find('.month-table-td').length) < 7;
	  });
	  // If no available row, create a new one
	  if( row.length === 0 ) {
		table.append('<div class="days month-table-tr"/>');
		row = table.find('.month-table-tr').last();
	  }
	  return row;
	}

	// Create an unique date string for cell lookup
	function formattedDate( date ) {
	  return date.getFullYear() + '-' + monthNames[date.getMonth()] + '-' + date.getDate();
	}
	
	if (data) {
		if($.type(data) === "string") {
			data = [data];
		}
		if (data.constructor === Array) {
			dataCount = data.length;
			dataCurrent = 0;
			for(var i = 0; i < data.length; i++ ) {
				Tabletop.init( { key: data[i], callback: cacheThenGenerateCalendar, simpleSheet: true } );
	  		}
		}
	}
});