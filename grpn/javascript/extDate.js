/*
 * To localize / override any of the US specific values used in extDate all
 * that needs to be done is to override any/all of the items in the extDate
 * dictionary. For instance convert the days of the week to be localized into 
 * Spanish,one only needs to update the "days" key as such:
 *      extDate.days = {
            ['Domingo', 'Dom'],     // Sunday
            ['Lunes', 'Lun'],       // Monday
            ['Martes', 'Mar'],      // Tuesday
            ['Miercoles', 'Mie'],   // Wednesday
            ['Jueves', 'Jue']       // Thursday
            ['Viernes', 'Vie'],     // Friday
            ['Sabado', 'Sab']       // Saturday        
        };
 */
var extDate = {
    
    // The named months of the year, makes creating dates easier since
    // JavaScript dates are zero-based which is just weird...
    // i.e. 
    //      var d = new Date(2011, extDate.JANUARY, 4);
    // instead of:
    //      var d = new Date(2011, 0, 4);   <--- note january is month zero!
    JANUARY: 0,
    FEBRUARY: 1,
    MARCH: 2,
    APRIL: 3,
    MAY: 4,
    JUNE: 5,
    JULY: 6,
    AUGUST: 7,
    SEPTEMBER: 8,
    OCTOBER: 9,
    NOVEMBER: 10,
    DECEMBER: 11,
    
    // Days of the week helpers
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    
    // Information about each month keyed by month number:
    // Full name | Abbreviated Name | Days in month (non-leap year)
    months: {
        0: ['January', 'Jan', 31],
        1: ['February', 'Feb', 28],
        2: ['March', 'Mar', 31],
        3: ['April', 'Apr', 30],
        4: ['May', 'May', 31],
        5: ['June', 'Jun', 30],
        6: ['July', 'Jul', 31],
        7: ['August', 'Aug', 31],
        8: ['September', 'Sep', 30],
        9: ['October', 'Oct', 31],
        10: ['November', 'Nov', 30],
        11: ['December', 'Dec', 31]
    },
    
    // Information about each day of the week keyed by day number
    // Full name | Abbreviated Name
    days: {
        0: ['Sunday', 'Sun'],
        1: ['Monday', 'Mon'],
        2: ['Tuesday', 'Tue'],
        3: ['Wednesday', 'Wed'],
        4: ['Thursday', 'Thu'],
        5: ['Friday', 'Fri'],
        6: ['Saturday', 'Sat']
    },
    
    // Localized specific directives, these call strftime recursively to create
    // their result so the value is just a format string to use
    local: {
        'x': '%m/%d/%y',                // Localized date display
        'X': '%H:%M:%S',                // Localized time display
        'c': '%a %b %d %H:%M:%S %Y',    // Localized date/time display
        'p': ['AM', 'PM']               // localizations for AM/PM
    },
    
    expressions: {
        '%': /%/,                       // Escaped % sign
        'Y': /^\d\d\d\d/,               // 4-digit year
        'm': /^1[0-2]|0[1-9]|[1-9]/,    // month
        'd': /^3[0-1]|[1-2]\d|0[1-9]|[1-9]| [1-9]/,  // day of month 1-31
        'H': /^2[0-3]|[0-1]\d|\d/,      // 24 hour clock
        'M': /^[0-5]\d|\d/,             // Minute 00-59
        'S': /^[0-5]\d|\d/,             // Seconds 00-59 (not we do not support leap seconds)
        'y': /^\d\d/,                   // 2-digit year
        'I': /^1[0-2]|0[1-9]|[1-9]| [1-9]/,      // 12 hour clock
        'j': /^36[0-6]|3[0-5]\d|[1-2]\d\d|0[1-9]\d|00[1-9]|[1-9]\d|0[1-9]|[1-9]/, // day of year 1-366
        'w': /^[0-6]/,                           // Day of week 0-6
        'W': /^5[0-3]|[0-4]\d|\d/,              // Week of year (monday starts week)
        'U': /^5[0-3]|[0-4]\d|\d/,              // Week of year (sunday starts week)
        
        // NOTE: These are nulled out for now, but the RegEx for each is built
        // dynamically when it is needed. This is to allow for proper localization.
        'B': null,
        'b': null,
        'p': null,
        'A': null,       
        'a': null
    }
};

// =====================
// = Date.isLeapYear() =
// =====================
if(typeof Date.prototype.isLeapYear !== 'function') {
    Date.prototype.isLeapYear = function() {
        var isLeapYear = false;
        var year = this.getFullYear();
        if(year % 400 === 0) {
            isLeapYear = true;
        } else if(year % 100 === 0) {
            isLeapYear = false;
        } else if(year % 4 === 0) {
            isLeapYear = true;
        } else {
            isLeapYear = false;
        }
        return isLeapYear;
    };
}

// =============================
// = Date.isLeapYear() wrapper =
// =============================
if(typeof Date.isLeapYear !== 'function') {
    Date.isLeapYear = function(year) {
        var d = new Date(year, extDate.JANUARY, 1);
        return d.isLeapYear();
    };
}

// ===================
// = Date.strftime() =
// ===================
if(typeof Date.prototype.strftime !== 'function') {
    Date.prototype.strftime = function(format, useUTC) {
        var year = null;        // variable used within the switch statement
        var month = null;       // variable used within the switch statement
        var hour = null;        // variable used within the switch statement
        var week = null;
        var days = null;
        var today = null;
        var outString = "";     // output string
        var remainingFormat = format;   // format string after being chopped up
        
        var realDay = this.getDay();
        var realMonth = this.getMonth();
        var realDate = this.getDate();
        var realHours = this.getHours();
        var realMinutes = this.getMinutes();
        var realSeconds = this.getSeconds();
        var realFullYear = this.getFullYear(); 
        
        // If useUTC is set, then use the UTC values instead of whatever the
        // local time zone is
        if(useUTC) {
            realDay = this.getUTCDay();
            realMonth = this.getUTCMonth();
            realDate = this.getUTCDate();
            realHours = this.getUTCHours();
            realMinutes = this.getUTCMinutes();
            realSeconds = this.getUTCSeconds();
            realFullYear = this.getUTCFullYear();
        }
        
        var index = remainingFormat.indexOf('%');
        while(index !== -1) {
            // get the directive character
            var directive = remainingFormat.charAt(index+1);
            outString += remainingFormat.substring(0,index);
            switch(directive) {
                case 'a': // Abbreviated weekday name
                    outString += extDate.days[realDay][1];
                    break;
                case 'A': // Full weekday name
                    outString += extDate.days[realDay][0];
                    break;
                case 'b': // Abbreviated month name
                    outString += extDate.months[realMonth][1];
                    break;
                case 'B': // Full month name
                    outString += extDate.months[realMonth][0];
                    break;
                case 'c': // Locale's appropriate date/time representation
                    outString += this.strftime(extDate.local['c'], useUTC);
                    break;
                case 'd': // Day of month as decimal number 1-31
                    outString += realDate;
                    break;
                case 'H': // Hour (24-hour clock) as decimal number 0-23
                    outString += realHours;
                    break;
                case 'I': // Hour (12-hour clock) as decimal number 1-12
                    hour = realHours > 12 ? realHours-12 : realHours;
                    outString += hour;
                    break;
                case 'j': // Day of year as a decimal number 1-366
                    days = 0;
                    month = realMonth;
                    for(var i=0; i< month; i++) {
                        days += extDate.months[i][2];
                        // if it's a leap year and feb, we need to add an extra day
                        if(this.isLeapYear() && i==1) {
                            days += 1;
                        }
                    }
                    days += realDate;
                    outString += days;
                    break;
                case 'm': // Month as number 1-12
                    outString += realMonth + 1;
                    break;
                case 'M': // Minute 0-59
                    outString += realMinutes;
                    break;
                case 'p': // AM vs PM
                    if(this.getHours() < 12) {
                        outString += extDate.local['p'][0];
                    } else {
                        outString += extDate.local['p'][1];
                    }
                    break;
                case 'S': // Second as number 0-59
                    outString += realSeconds;
                    break;
                case 'U': // Week number of year starting on sunday
                    // A: Find the number of days from Jan 1st to the 1st sunday
                    // B: Find the numberof days in the year for the date
                    // Take the difference B-A and divide by 7
                    week = 0;
                    var days_til_sunday = 0;
                    today = new Date(realFullYear, extDate.JANUARY, 1);
                    while(today.getDay() !== 0) {
                        today.setDate(today.getDate()+1);
                        days_til_sunday++;
                    }
                    days = parseInt(this.strftime("%j", useUTC), 10);
                    // Only run the calculation if the day in question is after the
                    // first sunday of the year.
                    if(days > days_til_sunday) {
                        week = Math.ceil((days-days_til_sunday) / 7);    
                    }
                    
                    outString += week;
                    break;
                case 'w': // Weekday as number 0-6
                    outString += realDay;
                    break;
                case 'W': // Week number of year 0-53 starting on monday
                    // A: Find the number of days from Jan 1st to the 1st monday
                    // B: Find the numberof days in the year for the date
                    // Take the difference B-A and divide by 7
                    week = 0;
                    var days_til_monday = 0;
                    today = new Date(realFullYear, extDate.JANUARY, 1);
                    while(today.getDay() !== 1) {
                        today.setDate(today.getDate()+1);
                        days_til_monday++;
                    }
                    days = parseInt(this.strftime("%j", useUTC), 10);
                    // Only run the calculation if the day in question is after the
                    // first sunday of the year.
                    if(days > days_til_monday) {
                        week = Math.ceil((days-days_til_monday) / 7);    
                    }
                    
                    outString += week;
                    break;
                case 'x': // Locale's appropriate date representation
                    outString += this.strftime(extDate.local['x'], useUTC);
                    break;
                case 'X': // Locale's appropriate time representation
                    outString += this.strftime(extDate.local['X'], useUTC);
                    break;
                case 'y': // 2 digit year
                    year = realFullYear.toString();
                    outString += year.substring(2);
                    break;
                case 'Y': // 4 digit year
                    outString += realFullYear;
                    break;
                case 'Z': // Time zone name
                    // NOTE: Not implelemented due to JS limitations w/ timezones
                    outString += "";
                    break;
                case '%': // % sign
                    outString += "%";
                    break;
                default:
                    break;
            }
            
            remainingFormat = remainingFormat.substring(index+2);
            index = remainingFormat.indexOf('%');
        }
        outString += remainingFormat;
        return outString;
    };
}

// ===================
// = String.strptime =
// ===================
if(typeof Date.strptime !== 'function') {
    Date.strptime = function(string, format, useUTC) { 
        var remainingFormat = format;
        var remainingString = string;
        var index = format.indexOf('%');
        var match = null;
        var matches = {};
        var days_in_month = null;
        
        var year = null;
        var month = null;
        var hour = null;
        var day = null;
        
        // These variables store whatever we parse out
        var realFullYear = 1900;
        var realMonth = 0;
        var realDate = 1;
        var realDay = null;// needed?
        var realHours = 0;
        var realMinutes = 0;
        var realSeconds = 0;
        
        // Variables used to store pieces of information that we need to 
        // reconstruct a full date
        var day_of_week = null;
        var week_of_year = null;
        var week_starts_on = null;
        
        while(index !== -1) {
            var startString = remainingFormat.substring(0,index);
            var directive = remainingFormat.charAt(index+1);
            
            if(remainingString.indexOf(startString)!==0) {
                throw new Error("time data '" + string + "' does not match format '" + format + "'");
            }
            
            remainingString = remainingString.substring(startString.length);
            remainingFormat = remainingFormat.substring(index+2);
            index = remainingFormat.indexOf('%');
            
            // If it is a localized directive, we just replace the directive with
            // a new set of directives specific to the local, find the next directive
            // and continue on
            if(directive==='x' || directive==='X' || directive==='c') {
                remainingFormat = extDate.local[directive] + remainingFormat;
                index = remainingFormat.indexOf('%');
                continue;
            }
            
            
            
            if(!extDate.expressions.hasOwnProperty(directive)){
                throw new Error("'" + directive + "' is a bad directive in format '%" + directive + "'");
            } 
            
            // Helper method which builds a regular expression from a dictionary 'obj'
            // that has 'count' items which are arrays then using the 'index' item in
            // the array
            var build_re_from_obj = function(obj, count, index) {
                var s = "";
                
                // if count wasn't specified grab the length of the object
                if(!count) {
                    count = obj.length;
                }
                for(var i=0;i<count;i++) {
                    // TODO: We should escape the string before adding to the regex
                    if(index!==null && index!==undefined) {
                        s+=obj[i][index];
                    } else {
                        s+=obj[i];
                    }
                    if(i!==count-1) {
                        s+="|";
                    }
                }
                s = "^" + s;
                return new RegExp(s);
            };
            
            // Grab the regular expression from the settings
            // Dynamically build a new RegEx if it one of the directives
            // that has to be localized
            var re = extDate.expressions[directive];
            if(directive==='a') {
                re = build_re_from_obj(extDate.days, 7, 1);
            } else if(directive==='A') {
                re = build_re_from_obj(extDate.days, 7, 0);
            } else if(directive==='B') {
                re = build_re_from_obj(extDate.months, 12, 0);
            } else if(directive==='b') {
                re = build_re_from_obj(extDate.months, 12, 1);
            } else if(directive==='p') {
                re = build_re_from_obj(extDate.local['p']);
            }

            match = re.exec(remainingString);
            if(match) {
                matches[directive] = match[0];
                remainingString = remainingString.substring(match[0].length);
                match = null;
            } else {
                throw new Error("time data '" + string + "' does not match format '" + format + "'");
            }
                                    
            
        }
        
        if(remainingString!==remainingFormat) {
            throw new Error("time data '" + string + "' does not match format '" + format + "'");
        }
        
        
        // Process all the different tyeps of matches
        // We do this outside of the loop because some of the directives can
        // depend on each other. For example the 12 hour clock can use information
        // from AM/PM directive to figure out if it's 12am or 12pm
        if(matches["Y"]) {
            realFullYear = parseInt(matches["Y"], 10);
        }
        if(matches["m"]) {
            realMonth = parseInt(matches["m"], 10) - 1;
        }
        if(matches["d"]) {
            realDate = parseInt(matches["d"], 10);
        }
        if(matches["H"]) {
            realHours = parseInt(matches["H"], 10);
        }
        if(matches["M"]) {
            realMinutes = parseInt(matches["M"], 10);
        }
        if(matches["S"]) {
            realSeconds = parseInt(matches["S"], 10);
        }
        if(matches['y']) {
            // Open Group specification for strptime() states that a %y
            // value in the range of [00, 68] is in the century 2000, while
            // [69,99] is in the century 1900
            year = parseInt(matches['y'], 10);
            if(year<=68) {
                year += 2000;
            } else {
                year += 1900;
            }
            realFullYear = year;
        }
        // Full month name
        if(matches['B']) {
           month = matches['B'];
           for(index=0;index<12;index++) {
               if(extDate.months[index][0] === month) {
                   realMonth = index;
                   break;
               }
           }
        }
        // Abbreviated month name
        if(matches['b']) {
           month = matches['b'];
           for(index=0;index<12;index++) {
               if(extDate.months[index][1] === month) {
                   realMonth = index;
                   break;
               }
           }
        }
        
        // Day of week (numbered)
        if(matches['w']) {
            day_of_week = parseInt(matches['w'], 10);
        }
        // Day of week (abbreviated)
        if(matches['a']) {
            day = matches['a'];
            for(index=0;index<7;index++) {
                if(extDate.days[index][1] === day) {
                    day_of_week = index;
                    break;
                }
            }
        }
        // Day of week (full)
        if(matches['A']) {
            day = matches['A'];
            for(index=0;index<7;index++) {
                if(extDate.days[index][0] === day) {
                    day_of_week = index;
                    break;
                }
            }
        }
        
        if(matches['W'] || matches['U']) {
            if(matches['W']) {
                week_of_year = parseInt(matches['W'], 10);
                week_starts_on = extDate.MONDAY;
            } else {
                week_of_year = parseInt(matches['U'], 10);
                week_starts_on = extDate.SUNDAY;
            }
        }
        
        // 12 hour clock
        if(matches['I']) {
            hour = parseInt(matches['I'], 10);
            
            // If am/pm was specified and it's pm, add 12
            if(matches['p'] && matches['p']===extDate.local['p'][1]) {
                if(hour!==12) {
                    hour += 12;
                }
            } else {
                if(hour===12) {
                    hour = 0;
                }
            }
            realHours = hour;
        }
        
        // day of year
        if(matches['j']) {
            day = parseInt(matches['j'], 10);
            for(month=extDate.JANUARY;month<=extDate.DECEMBER;month++) {
                days_in_month = extDate.months[month][2];
                if(Date.isLeapYear(realFullYear) && month===extDate.FEBRUARY) {
                    days_in_month+=1;
                }
                if(day-days_in_month >= 1) {
                    day-= days_in_month;
                } else {
                    break;
                }
            }
            realMonth = month;
            realDate = day;
        }
        
        // If we have a week of the year + day of the week + week_starts_on
        // we can calculate the date they are talking about
        if(week_of_year!==null && week_starts_on!==null && day_of_week!==null) {
            var remaining_days = null;
            var temp_date = new Date(year, extDate.JANUARY, 1);
            var first_day_of_week_1 = 1;
            year = parseInt(realFullYear, 10);
            
            first_day_of_week_1 = 1;
            temp_date = new Date(year, extDate.JANUARY, 1);
            while(temp_date.getDay()!==week_starts_on) {
                temp_date.setDate(temp_date.getDate()+1);
                first_day_of_week_1++;
            }
            
            if(week_of_year===0) {
                // Week zero is a special case, if the day they pick isn't in
                // the current year for week 0, we loop backwards to last year
                // For example: Tuesday Week 0 of 2010 would come back as "12/29/2009"
                // While Saturday Week 0 of 2010 would be "1/2/2010"
                temp_date = new Date(year, extDate.JANUARY, 1);
                // Figure out how many days to go back from the first day of week 1 to hit the day we want
                var date_diff = 0;
                if(week_starts_on==extDate.SUNDAY) {
                    date_diff = Math.abs(day_of_week - 7);    
                } else {
                    // we mod by 7 to handle sunday (0th day of week)
                    date_diff = Math.abs((day_of_week - 8) % 7);
                }
                
                // See if the day lies in this year or last year
                if(first_day_of_week_1 -  Math.abs(date_diff) >= 1) {
                    realDate = first_day_of_week_1 - date_diff;
                } else {
                    // We have to roll back from December 31st of last year a few days
                    day = extDate.months[extDate.DECEMBER][2];
                    day -= Math.abs((first_day_of_week_1 - date_diff));
                    realFullYear = year-1;
                    realMonth = extDate.DECEMBER;
                    realDate = day;
                }
            } else {
                remaining_days = first_day_of_week_1 + (week_of_year-1)*7;
                
                for(month=extDate.JANUARY;month<=extDate.DECEMBER;month++) {
                    days_in_month = extDate.months[month][2];
                    // If it's a leap year and february we need to add an extra day
                    if(Date.isLeapYear(year) && month===extDate.FEBRUARY) {
                        days_in_month += 1;
                    }
                    if(remaining_days-days_in_month > 0) {
                        remaining_days -= days_in_month;
                    } else {
                        break;
                    }
                }
                realMonth = month;
                realDate = remaining_days;
                
                temp_date = new Date(realFullYear, realMonth, realDate);
                // Now that we have the correct month and beginning of the week
                // we can loop through until we get the right day of week
                while(temp_date.getDay()!==day_of_week) {
                    temp_date.setDate(temp_date.getDate()+1);
                }
                realDate = temp_date.getDate();
            }
        } 
        
        temp_date = new Date(realFullYear, realMonth, realDate, realHours, realMinutes, realSeconds, 0);
        if(useUTC) {
            temp_date.setUTCFullYear(realFullYear);
            temp_date.setUTCMonth(realMonth);
            temp_date.setUTCDate(realDate);
            temp_date.setUTCHours(realHours);
            temp_date.setUTCMinutes(realMinutes);
            temp_date.setUTCSeconds(realSeconds);
        }
        return temp_date;
    };
}
// String.strptime
if(typeof String.prototype.strptime !== 'function') {
    String.prototype.strptime = function(format, useUTC) { 
        return Date.strptime(this, format, useUTC);
    };
}