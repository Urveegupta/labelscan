import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/constants/colors';
import strings from '../src/constants/strings';
import { submitProduct } from '../src/database/database';
import { scoreProduct } from '../src/engine/scoringEngine';
import ScoreBadge from '../src/components/ScoreBadge';

const isWeb = Platform.OS === 'web';
const F = isWeb
  ? { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
  : {};

export default function AddProductScreen() {
  const { barcode: initialBarcode } = useLocalSearchParams();
  const router = useRouter();

  const [barcode, setBarcode] = useState(initialBarcode || '');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  function handlePreview() {
    if (!ingredients.trim()) {
      setPreview(null);
      return;
    }
    const result = scoreProduct({
      ingredients_text: ingredients,
    });
    setPreview(result);
  }

  async function handleSubmit() {
    if (!barcode.trim() || !name.trim()) {
      if (isWeb) {
        window.alert('Please enter at least the barcode and product name.');
      } else {
        Alert.alert('Missing Info', 'Please enter at least the barcode and product name.');
      }
      return;
    }

    setSubmitting(true);
    try {
      await submitProduct({
        barcode: barcode.trim(),
        name: name.trim(),
        brand: brand.trim(),
        ingredients_text: ingredients.trim(),
      });

      if (isWeb) {
        const viewProduct = window.confirm(
          strings.submittedSuccess + '\n\nClick OK to view the product, or Cancel to go back.'
        );
        if (viewProduct) {
          router.replace(`/product/${barcode.trim()}`);
        } else {
          router.back();
        }
      } else {
        Alert.alert('Success', strings.submittedSuccess, [
          {
            text: 'View Product',
            onPress: () => router.replace(`/product/${barcode.trim()}`),
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (err) {
      if (isWeb) {
        window.alert('Failed to save product. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save product. Please try again.');
      }
    }
    setSubmitting(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: strings.addProduct }} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="create-outline" size={isWeb ? 24 : 32} color={Colors.primary} />
            </View>
            <Text style={[styles.headerTitle, F]}>Add a New Product</Text>
            <Text style={[styles.headerDesc, F]}>
              Help build our database by adding products you scan.
              Enter the details exactly as they appear on the label.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, F]}>{strings.barcode} *</Text>
              <TextInput
                style={[styles.input, F, initialBarcode ? styles.inputDisabled : null]}
                value={barcode}
                onChangeText={setBarcode}
                placeholder="e.g. 8901058811001"
                placeholderTextColor="#B0B0B0"
                keyboardType="numeric"
                editable={!initialBarcode}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, F]}>{strings.productName} *</Text>
              <TextInput
                style={[styles.input, F]}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Maggi 2-Minute Noodles"
                placeholderTextColor="#B0B0B0"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, F]}>{strings.brandName}</Text>
              <TextInput
                style={[styles.input, F]}
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g. Nestle"
                placeholderTextColor="#B0B0B0"
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, F]}>{strings.ingredientsList}</Text>
              <Text style={[styles.fieldHint, F]}>
                Copy ingredients exactly from the label, separated by commas
              </Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, F]}
                value={ingredients}
                onChangeText={setIngredients}
                onBlur={handlePreview}
                placeholder="e.g. Wheat Flour (Maida), Sugar, Palm Oil, Salt, INS 503, INS 322..."
                placeholderTextColor="#B0B0B0"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Live Preview */}
          {preview && (
            <View style={styles.previewCard}>
              <Text style={[styles.previewTitle, F]}>Score Preview</Text>
              <View style={styles.previewContent}>
                <ScoreBadge grade={preview.grade} score={preview.score} size="small" />
                <View style={styles.previewStats}>
                  <Text style={[styles.previewStat, F]}>
                    {preview.stats.totalIngredients} ingredients detected
                  </Text>
                  {preview.stats.harmfulAdditives > 0 && (
                    <Text style={[styles.previewStat, F, { color: Colors.harmful }]}>
                      {preview.stats.harmfulAdditives} harmful additive(s)
                    </Text>
                  )}
                  {preview.stats.concerningAdditives > 0 && (
                    <Text style={[styles.previewStat, F, { color: Colors.concerning }]}>
                      {preview.stats.concerningAdditives} concerning additive(s)
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
            <Text style={[styles.submitButtonText, F]}>
              {submitting ? 'Submitting...' : strings.submit}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, F]}>{strings.cancel}</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#FAFAFA' : Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    ...(isWeb ? { alignItems: 'center' } : {}),
  },
  inner: {
    width: '100%',
    maxWidth: isWeb ? 520 : undefined,
    ...(isWeb ? {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      padding: 36,
      marginTop: 16,
    } : {}),
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    ...(isWeb ? {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#E8F5E9',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    } : {}),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: isWeb ? 0 : 10,
  },
  headerDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  field: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: isWeb ? '#F9FAFB' : Colors.surface,
    borderWidth: 1,
    borderColor: isWeb ? '#D1D5DB' : Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    ...(isWeb ? { outlineStyle: 'none' } : {}),
  },
  inputDisabled: {
    backgroundColor: isWeb ? '#F3F4F6' : Colors.divider,
    color: Colors.textMuted,
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 12,
  },
  previewCard: {
    backgroundColor: isWeb ? '#F9FAFB' : Colors.surface,
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: isWeb ? '#E5E7EB' : Colors.border,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  previewStats: {
    flex: 1,
  },
  previewStat: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
    ...(isWeb ? { cursor: 'pointer' } : {
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    ...(isWeb ? { cursor: 'pointer' } : {}),
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
  bottomPadding: {
    height: isWeb ? 20 : 40,
  },
});
