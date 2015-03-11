package com.appcoin.plugins.smsreceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONObject;
import org.json.JSONException;

public class SmsReceiver extends BroadcastReceiver {

    public static final String SMS_EXTRA_NAME="pdus";
    private CallbackContext callback_receive;
    private boolean isReceiving=true;

    private boolean broadcast=false;//continue or not the message broadcast to the other broadcast receivers waiting for an incoming SMS

    @Override
    public void onReceive(Context context, Intent intent) {

        Bundle extras=intent.getExtras(); //get the sms map
        if(extras!=null)
        {
            Object[] smsExtra=(Object[])extras.get(SMS_EXTRA_NAME); //get received sms array

            for(int i=0;i<smsExtra.length;i++)
            {
                SmsMessage sms=SmsMessage.createFromPdu((byte[])smsExtra[i]);
                if(isReceiving && callback_receive!=null)
                {
                    try {
                        JSONObject message = new JSONObject();
                        message.put("sender", sms.getOriginatingAddress()).put("body", sms.getMessageBody());
                        PluginResult result=new PluginResult(PluginResult.Status.OK, message);
                        result.setKeepCallback(true);
                        callback_receive.sendPluginResult(result);
                    } catch (JSONException e) {

                    }
                }
            }

            //if the plugin is active and we don't want to broadcast to other receivers
            if(isReceiving && !broadcast)
            {
                abortBroadcast();
            }
        }
    }


    public void broadcast(boolean v)
    {
        broadcast=v;
    }

    public void startReceiving(CallbackContext ctx)
    {
        callback_receive=ctx;
        isReceiving=true;
    }

    public void stopReceiving()
    {
        callback_receive=null;
        isReceiving=false;
    }
}
