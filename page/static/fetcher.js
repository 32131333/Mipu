/* BetterFetch */
/* Specially created for Mipu Client */

class BFetch {
	constructor(headers, refetch, failedRefetch, returnOnlyRefetched, urlStart) {
		this.headers = headers ?? new Headers();
		this.refetch = refetch ?? (()=>null);
		this.failedRefetch = failedRefetch ?? this.refetch;
		this.returnOnlyRefetched = returnOnlyRefetched ?? false;
		this.urlStart = urlStart ?? "";
	}
	
	async fetch(url, methodType, body, refetch, failedRefetch) {
		let retried;
		let initialBody = body;
		
		const abortController = new AbortController();
		const retry = async () => {
			retried = true;
			return await this.fetch(url, methodType, initialBody, refetch, failedRefetch);
		};
		const abort = ()=>abortController.abort();
		
		
		if (body instanceof FormData) {
			this.headers.delete("Content-Type");
		} else if (body instanceof ArrayBuffer || body instanceof Blob || body instanceof File) {
			this.headers.set("Content-Type", "application/octet-stream");
		} else if (typeof body == "object") {
			body = JSON.stringify(body);
			this.headers.set("Content-Type", "application/json; charset=UTF-8");
		} else {
			this.headers.set("Content-Type", "text/plain; charset=UTF-8");
		};
		
		let resp;
		let failed = false;
		let exception;
		
		
		try {
			resp = await fetch(this.urlStart+url, {signal: abortController.signal, method: methodType, headers: this.headers, body: body});
		} catch(e) {
			failed = true;
			exception = e;
		};
		
		refetch = refetch ?? this.refetch;
		failedRefetch = failedRefetch ?? this.failedRefetch;
		
		let refetched;
		
		let json;
		let text;
		let bodyReader;
		
		try {
			if (resp && resp.headers.get("transfer-encoding")!="chunked" && !resp.headers.get("content-type").includes("stream") && !resp.headers.get("x-is-chunked")) {
				text = await resp.text();
				json = JSON.parse(text);
			} else {
				bodyReader = resp.body.getReader();
			};
		} catch(e) {
			null;
		};
		
		let Refetched;
		
		
		const args = {url, methodType, body, failed, exception, json, text, Refetched, bodyReader, abort};
		if (resp && resp.status < 400) {
			try { Refetched = await this.refetch(resp, args, retry) } catch { null };
			args.Refetched = Refetched;
			
			if (refetch != this.refetch) refetched = await refetch(resp, args, retry) ?? Refetched
			else refetched = Refetched;
		} else {
			try { Refetched = await this.failedRefetch(resp, args, retry) } catch { null };
			args.Refetched = Refetched;
			
			if (failedRefetch != this.failedRefetch) refetched = await failedRefetch(resp, args, retry) ?? Refetched
			else refetched = Refetched;
		};
		
		if (this.returnOnlyRefetched || retried) return refetched
		else return {resp, failed, refetched, args};
	}
	
	_morphJSONBody(body) {
		let preResult = [];
		for (const a in body) {
			let r = body[a];
			if (typeof r == "object") {
				r = JSON.stringify(r);
			};
			
			preResult.push(`${a}=${r}`);
		};
		if (preResult.length>0) return "?"+preResult.join("&")
		else return "";
	}
	
	get(url, body, refetch, failedRefetch) {
		return this.fetch(url+this._morphJSONBody(body), "GET", undefined, refetch, failedRefetch); // GET/HEAD/OPTIONS cannot have body
	}
	head(url, body, refetch, failedRefetch) {
		return this.fetch(url+this._morphJSONBody(body), "HEAD", undefined, refetch, failedRefetch); // GET/HEAD/OPTIONS cannot have body
	}
	options(url, body, refetch, failedRefetch) {
		return this.fetch(url+this._morphJSONBody(body), "OPTIONS", undefined, refetch, failedRefetch); // GET/HEAD/OPTIONS cannot have body
	}
	
	post(url, body, refetch, failedRefetch) {
		return this.fetch(url, "POST", body, refetch, failedRefetch)
	}
	put(url, body, refetch, failedRefetch) {
		return this.fetch(url, "PUT", body, refetch, failedRefetch)
	}
	remove(url, body, refetch, failedRefetch) {
		return this.fetch(url, "DELETE", body, refetch, failedRefetch)
	}
	delete(url, body, refetch, failedRefetch) {
		return this.fetch(url, "DELETE", body, refetch, failedRefetch)
	}
	patch(url, body, refetch, failedRefetch) {
		return this.fetch(url, "PATCH", body, refetch, failedRefetch)
	}
}