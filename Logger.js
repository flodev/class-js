
window.Logger =
{
    maxLoggingMessaged: 150,
    logMessages: [],

    log: function(msg)
    {
        this.logMessages.push(msg); 
    },

    send: function()
    {
        if (!this.logMessages.length) {
            return;
        }

        console.log(this.logMessages[this.logMessages.length -1]);
    }
}
