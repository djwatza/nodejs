var elasticsearch = require('es');

module.exports =
{
    index:'vehicle',
    type:'vehicle',
    host: '127.0.0.1',
    es:null,
    client:function()
    {
        if(null == this.es)
        {
            this.es = elasticsearch({
                _index : 'vehicle',
                _type : 'vehicle',
                host : '127.0.0.1'
            });
        }

        return this.es;
    }
};