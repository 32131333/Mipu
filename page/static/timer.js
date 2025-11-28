/* Супир таймир. Более упращенная работа с setTimeout */
class Timer {
	constructor(interval, defaultFunc) {
		this.interval = interval ?? 0;
		this._timeoutId = null;
		this.working = false;
		this.defaultFunc = defaultFunc;
	}
	cancel() {
		if (!this.working) return false;
		
		if (this._timeoutId) {
			clearTimeout(this._timeoutId);
			this._timeoutId = null;
		};
		
		if (this._onCancel) {
			this._onCancel(false);
			this._onCancel = undefined;
		};
		
		this.working = false;
		return true;
	}
	start(func, onCancel) {
		this.cancel();
		
		this._onCancel = onCancel;
		const id = setTimeout(()=>{
			this._timeoutId = null;
			this.working = false;
			return func ? func(true) : this.defaultFunc(true);
		}, this.interval);
		this._timeoutId = id;
		this.working = true;
		return true;
	}
}
export default Timer;