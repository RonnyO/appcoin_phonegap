package com.appcoin.plugins.androidreferrer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.io.FileOutputStream;

public final class AndroidReferrerReceiver extends BroadcastReceiver {
	static final String INSTALL_ACTION = "com.android.vending.INSTALL_REFERRER";

	public void onReceive(Context ctx, Intent intent) {
		String referrer = intent.getStringExtra("referrer");
		Log.w("AndroidReferrerReceiver", "onReceive: " + referrer);

		if (!INSTALL_ACTION.equals(intent.getAction()) || referrer == null) {
			return;
		}

		FileOutputStream outputStream;
		try {
		    outputStream = ctx.openFileOutput("android_referrer.tmp", Context.MODE_PRIVATE);
		    outputStream.write(referrer.getBytes());
		    outputStream.close();
		} 
		catch (Exception e) {
		    e.printStackTrace();
		}
	}
}