angular.module('lwAudio', [])

.factory('lwAudio', function($interval, $q) {

	var Audio = function () {

		//Native object
		this.nativeObject = document.createElement("AUDIO");

		//Watchers
		this.cancelWatchers = null;
		this.volume = 0;
		this.duration = 0;
		this.currentTime = 0;
		this.remaining = 0;
		this.toFinishCallback = {
			active: false,
			time: null,
			callback: null
		};

		//Events
		this.canPlay = false;
	}

	//Update watcher properties
	Audio.prototype.updateWatchers = function() {

		//Update wachers
		this.volume = this.nativeObject.volume;
		this.duration = this.nativeObject.duration;
		this.currentTime = this.nativeObject.currentTime;
		this.remaining = this.nativeObject.duration - this.nativeObject.currentTime;

		//Check callback events
		if (this.toFinishCallback.active && (this.remaining <= this.toFinishCallback.time)) {
			this.toFinishCallback.active = false;
			this.toFinishCallback.callback();
		}

	}

	//Start watchers
	Audio.prototype.startWatchers = function(delay) {
		
		if (!this.cancelWatchers) {

			var self = this;
			this.cancelWatchers = $interval(function() {
				self.updateWatchers();
			}, delay);	
		}

	};

	//Stop watchers
	Audio.prototype.stopWatchers = function() {

		if (this.cancelWatchers) {
			$interval.cancel(this.cancelWatchers);
			this.cancelWatchers = null;			
		}
	}

	//Load audio
	Audio.prototype.load = function(src) {

		var deferred = $q.defer();

		this.canPlay = false;

		//Load audio file
		if (src) {
			this.nativeObject.src = src;
		}
		this.nativeObject.load();
		var self = this;

		//Capture canplay event
		var canplayEvent = function() {
			self.canPlay = true;
			self.updateWatchers();
			self.nativeObject.removeEventListener('canplay', canplayEvent);
			self.nativeObject.removeEventListener('error', errorEvent);
			deferred.resolve();
		}
		this.nativeObject.addEventListener('canplay', canplayEvent);

		//Capture canplay event
		var errorEvent = function() {
			self.canPlay = false;
			self.nativeObject.removeEventListener('canplay', canplayEvent);
			self.nativeObject.removeEventListener('error', errorEvent);
			deferred.reject();
		}
		this.nativeObject.addEventListener('error', errorEvent);

		return deferred.promise;
	};

	//Play audio
	Audio.prototype.play = function() {

		if (this.canPlay) {
			this.nativeObject.play();	
		}
		
	};

	//Pause audio
	Audio.prototype.pause = function() {

		this.nativeObject.pause();
	};

	//Update volumen
	Audio.prototype.setVolume = function(volume) {

		this.nativeObject.volume = volume;
	};

	//Set to finish callback
	Audio.prototype.setToFinishCallback = function(time, callback) {

		this.toFinishCallback = {
			active: true,
			time: time,
			callback: callback
		};
	};

	return {
		getInstance: function () {
			return new Audio();
		}
	};

});