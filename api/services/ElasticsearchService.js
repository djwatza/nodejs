var elasticsearch = require('es');

module.exports =
{
    index:'vehicle',
    type:'vehicle',
    host: '54.148.1.144',
    es:null,
    client:function()
    {
        if(null == this.es)
        {
            this.es = elasticsearch({
                _index : 'vehicle',
                _type : 'vehicle',
                host : '54.148.1.144'
            });
        }

        return this.es;
    }
};