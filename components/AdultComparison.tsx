import { StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { type DurationDescriptor, getAnalogy } from "@/lib/calculations";

type AdultComparisonProps = {
  equivalent: DurationDescriptor;
  adultAge?: number;
};

export default function AdultComparison({ equivalent, adultAge = 30 }: AdultComparisonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const analogy = getAnalogy(equivalent.minutes);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.accentLight, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        To a {adultAge}-year-old, this feels like
      </Text>
      <Text style={[styles.value, { color: colors.accent }]}>{equivalent.raw}</Text>
      {analogy && <Text style={[styles.analogy, { color: colors.secondaryText }]}>{analogy}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  label: {
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    fontSize: 19,
    fontWeight: "700",
  },
  analogy: {
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 18,
  },
});
