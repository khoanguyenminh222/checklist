import React, { useEffect } from 'react';
import Toast from 'react-native-root-toast';

const ToastMesssage = ({ message }) => {
  useEffect(() => {
    const toast = Toast.show(message, {
      duration: Toast.durations.LONG,
    });
    setTimeout(() => {
      Toast.hide(toast);
    }, 1500);
  }, [message]);

  return null;
};

export default ToastMesssage;
