import React, { useEffect } from 'react';
import Toast from 'react-native-root-toast';

const ToastMesssage = ({ message, time }) => {
  useEffect(() => {
    const toast = Toast.show(message, {
      duration: Toast.durations.LONG,
    });
    setTimeout(() => {
      Toast.hide(toast);
    }, time);
  }, [message]);

  return null;
};

export default ToastMesssage;
