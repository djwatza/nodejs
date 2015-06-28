/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  String.prototype.toSlug = function()
  {
    return this.toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
  };

    String.prototype.fromSlug = function()
    {
        return this
            .replace('-',' ')
            .replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

    String.prototype.toTitleCase = function()
    {
        return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

  /**
   * http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
   *
   * Number.prototype.format(n, x)
   *
   * @param integer n: length of decimal
   * @param integer x: length of sections
   */
  Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
  };

  Number.prototype.monthlyPayment = function(){
      var p = Number(this);
      return Math.round(((p *.0199) + p) / 72)
  };

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
