package com.appcoin.plugins.androidreferrer;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.ClipDescription;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;

public class AndroidReferrer extends CordovaPlugin {

    private static final String actionGetReferrer = "getReferrer";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.w("AndroidReferrer", "execute: " + action);

        if (action.equals(actionGetReferrer)) {
            String referrer = readReferrerFromFile();
            Log.w("AndroidReferrer", "referrer: " + referrer);
            callbackContext.success(referrer);
            return true;
        }

        return false;
    }

    private String readReferrerFromFile() {
	    String ret = "";

	    try {
	    	Context ctx=this.cordova.getActivity().getApplicationContext(); 
	        InputStream inputStream = ctx.openFileInput("android_referrer.tmp");

	        if ( inputStream != null ) {
	            InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
	            BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
	            String receiveString = "";
	            StringBuilder stringBuilder = new StringBuilder();

	            while ( (receiveString = bufferedReader.readLine()) != null ) {
	                stringBuilder.append(receiveString);
	            }

	            inputStream.close();
	            ret = stringBuilder.toString();
	        }
	    }
	    catch (FileNotFoundException e) {
	        Log.e("AndroidReferrer", "File not found: " + e.toString());
	    } catch (IOException e) {
	        Log.e("AndroidReferrer", "Can not read file: " + e.toString());
	    }

	    return ret;
	}
}


