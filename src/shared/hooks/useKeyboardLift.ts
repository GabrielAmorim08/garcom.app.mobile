import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';

const CHANGE_EVENT = Platform.OS === 'ios' ? 'keyboardWillChangeFrame' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/**
 * How far up something pinned to the bottom of the screen has to move to stay above the
 * keyboard, for the few screens whose input must never be covered (the chat). It is
 * measured from where the keyboard actually starts, not from the height the system
 * reports, which third-party keyboards inflate.
 */
export function useKeyboardLift(): number {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const change = Keyboard.addListener(CHANGE_EVENT, event => {
      const { screenY, height } = event.endCoordinates;
      const fromTop = Dimensions.get('window').height - screenY;

      setLift(Math.max(0, Platform.OS === 'ios' ? fromTop : height));
    });
    const hide = Keyboard.addListener(HIDE_EVENT, () => setLift(0));

    return () => {
      change.remove();
      hide.remove();
    };
  }, []);

  return lift;
}
