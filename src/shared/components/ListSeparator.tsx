import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../../theme';

/**
 * Gap between list rows. Defined at module level so FlatList keeps the same
 * component type across renders instead of remounting every separator.
 */
export function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: { height: spacing.md },
});
