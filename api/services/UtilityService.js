module.exports =
{
    _states: [
        { name: 'ALABAMA', abbreviation: 'AL'},
        { name: 'ALASKA', abbreviation: 'AK'},
        { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
        { name: 'ARIZONA', abbreviation: 'AZ'},
        { name: 'ARKANSAS', abbreviation: 'AR'},
        { name: 'CALIFORNIA', abbreviation: 'CA'},
        { name: 'COLORADO', abbreviation: 'CO'},
        { name: 'CONNECTICUT', abbreviation: 'CT'},
        { name: 'DELAWARE', abbreviation: 'DE'},
        { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
        { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
        { name: 'FLORIDA', abbreviation: 'FL'},
        { name: 'GEORGIA', abbreviation: 'GA'},
        { name: 'GUAM', abbreviation: 'GU'},
        { name: 'HAWAII', abbreviation: 'HI'},
        { name: 'IDAHO', abbreviation: 'ID'},
        { name: 'ILLINOIS', abbreviation: 'IL'},
        { name: 'INDIANA', abbreviation: 'IN'},
        { name: 'IOWA', abbreviation: 'IA'},
        { name: 'KANSAS', abbreviation: 'KS'},
        { name: 'KENTUCKY', abbreviation: 'KY'},
        { name: 'LOUISIANA', abbreviation: 'LA'},
        { name: 'MAINE', abbreviation: 'ME'},
        { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
        { name: 'MARYLAND', abbreviation: 'MD'},
        { name: 'MASSACHUSETTS', abbreviation: 'MA'},
        { name: 'MICHIGAN', abbreviation: 'MI'},
        { name: 'MINNESOTA', abbreviation: 'MN'},
        { name: 'MISSISSIPPI', abbreviation: 'MS'},
        { name: 'MISSOURI', abbreviation: 'MO'},
        { name: 'MONTANA', abbreviation: 'MT'},
        { name: 'NEBRASKA', abbreviation: 'NE'},
        { name: 'NEVADA', abbreviation: 'NV'},
        { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
        { name: 'NEW JERSEY', abbreviation: 'NJ'},
        { name: 'NEW MEXICO', abbreviation: 'NM'},
        { name: 'NEW YORK', abbreviation: 'NY'},
        { name: 'NORTH CAROLINA', abbreviation: 'NC'},
        { name: 'NORTH DAKOTA', abbreviation: 'ND'},
        { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
        { name: 'OHIO', abbreviation: 'OH'},
        { name: 'OKLAHOMA', abbreviation: 'OK'},
        { name: 'OREGON', abbreviation: 'OR'},
        { name: 'PALAU', abbreviation: 'PW'},
        { name: 'PENNSYLVANIA', abbreviation: 'PA'},
        { name: 'PUERTO RICO', abbreviation: 'PR'},
        { name: 'RHODE ISLAND', abbreviation: 'RI'},
        { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
        { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
        { name: 'TENNESSEE', abbreviation: 'TN'},
        { name: 'TEXAS', abbreviation: 'TX'},
        { name: 'UTAH', abbreviation: 'UT'},
        { name: 'VERMONT', abbreviation: 'VT'},
        { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
        { name: 'VIRGINIA', abbreviation: 'VA'},
        { name: 'WASHINGTON', abbreviation: 'WA'},
        { name: 'WEST VIRGINIA', abbreviation: 'WV'},
        { name: 'WISCONSIN', abbreviation: 'WI'},
        { name: 'WYOMING', abbreviation: 'WY' }
    ],
    state_abbr:function(state)
    {
        for (var i = 0, len = UtilityService._states.length; i < len; i++) {
            if(state.toLowerCase() == UtilityService._states[i].name.toLowerCase())
                return UtilityService._states[i].abbreviation;
        }

        return '';
    },
//  http://54.69.100.173:8080/crop/400x300/http://ucimages.services.autobytel.com/cyber/216797/i4JGDA5HB6EA327436_1.jpg
    crop_url: function(url, height, width, operation)
    {
        var base_url = sails.config.autodealio.images.base_url;

        return base_url + operation + "/" + width + "x" + height + "/" + url;
    },
//  http://stackoverflow.com/questions/4994201/is-object-empty
    empty: function (obj)
    {
    // null and undefined are "empty"
        if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
        if (obj.length && obj.length > 0) return false;
        if (obj.length === 0) return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }

        return true;
    }
};