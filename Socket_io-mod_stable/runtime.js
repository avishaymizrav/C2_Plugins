/*! Socket.IO.min.js build:0.8.7, production. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */
document.write("<script src='socket.io.min.js'><\/script>");

// ECMAScript 5 strict mode
"use strict";

//Socket plugin
assert2(cr,"cr namespace not created");
assert2(cr.plugins_,"cr.plugins not created");

cr.plugins_.Socket = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.Socket.prototype;

	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};

	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		this.dataStack = [];
		this.lastAddress = "";
		this.lastPort = 80;
		this.socket = null;
		this.LastDataArray = [];
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	instanceProto.onCreate = function()
	{
	};
	instanceProto.send = function(data)
	{
		var socket = this.socket;
		
		if(socket != null)
			socket["send"](data);
	};
	instanceProto.emit = function(ent,data)
	{
		var socket = this.socket;
		
		if(socket != null)
			socket["emit"](ent,data);
	};
	instanceProto.disconnect = function()
	{
		var socket = this.socket;
		
		if(socket != null)
			socket["disconnect"]();
	};
    var MAX_SLOTS_FOR_DATA = 100;
	instanceProto.connect = function(host,port)
	{		
		var socket = this.socket;
		
		if(socket != undefined || socket != null)
			socket["disconnect"]();
		
		this.lastAddress = host;
		this.lastPort = port;
		
		//socket = new io.Socket(host,{port:port,transports:["websocket","flashsocket","xhr-multipart","xhr-polling","json-polling"]});;
		socket = window["io"]["connect"]('http://' + host + ':' + port, {'force new connection': true});
		this.socket = socket;
		var instance = this;
		var runtime = instance.runtime;
		//socket.connect('http://' + host + ':' + port);
		socket["on"]
		(
			'message',
			function(data)
			{
                //if (instance.dataStack.length > MAX_SLOTS_FOR_DATA)
                //{
			    //    dataStack.splice(0,Math.ceil(MAX_SLOTS_FOR_DATA / 2));
                //}
				instance.dataStack.push(data);
			//	instance.LastDataArray = data.split(','); //Is this going to cause problems in multithreading? YES IT DID, is another update going to overwrite the one we currently read?
				runtime.trigger(pluginProto.cnds.OnData,instance);
			}
		);
		socket["on"]
		(
			'connect_failed',
			function(event)
			{
				runtime.trigger(pluginProto.cnds.OnError,instance);
			}
		);
		socket["on"]
		(
			'connect',
			function(event)
			{
				runtime.trigger(pluginProto.cnds.OnConnect,instance);
			}
		);
		socket["on"]
		(
			'disconnect',
			function()
			{
				runtime.trigger(pluginProto.cnds.OnDisconnect,instance);
				this.socket = null;
			}
		);
		
	};

	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;

	cnds.OnConnect = function()
	{
		return true;
	};
	cnds.OnDisconnect = function()
	{
		return true;
	};
	cnds.OnError = function()
	{
		return true;
	};
	cnds.OnData = function()
	{
		return true;
};
	cnds.IsDataAvailable = function () {
	    return (this.dataStack.length > 0);
	};

	pluginProto.acts = {};
	var acts = pluginProto.acts;

	acts.Connect = function(host,port)
	{
		host = host.toString();
		port = port.toString();
		
		this.connect(host,port);
	};
	acts.Send = function(data)
	{
		data = data.toString();
         		
		this.send(data);
	};
	acts.Emit = function(ent,data)
	{
		
		data = data.toString();
		ent = ent.toString();
         		
		this.emit(ent,data);
	};
	acts.Disconnect = function()
	{
		this.disconnect();
	};

	acts.SplitDataReceived = function () {
	    var oldest_data = get_last_data(this.dataStack);
	    this.LastDataArray = oldest_data.split(',');
	};

	pluginProto.exps = {};
	var exps = pluginProto.exps;
	
	function jpt_splice(arr, index) {
	    for (var i = index, len = arr.length - 1; i < len; i++)
	        arr[i] = arr[i + 1];

	    arr.length = len;
	}
	function get_last_data(dataStack)
	{
		var dataLength = dataStack.length;
		
		var data = "";
		if (dataLength > 0) {
		    data = dataStack[0];
		    jpt_splice(dataStack, 0);
		}
		return data;
	}
	
    //Warning this expression actually manipulates the data stack, be careful when evaluating it in Construct
	exps.LastData = function(result)
	{
		var dataStack = this.dataStack;
		
		var data = get_last_data(dataStack);
		result.set_string(data);
	};
	exps.LastPort = function(result)
	{
		result.set_string(this.lastPort);
	};
	exps.LastAddress = function(result)
	{
		result.set_string(this.lastAddress);
	};
	
	// Splits by a comma the last data got into an array 
	exps.LastDataElement = function (ret, index)
	{
		var element = "";
		if (index < this.LastDataArray.length)
			element = this.LastDataArray[index];
		ret.set_string(element);
	};

}());
