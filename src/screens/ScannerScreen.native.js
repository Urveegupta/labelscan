import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import strings from '../constants/strings';

// ── Barcode validation (GS1 mod-10 check digit) ────────────────────
function isValidBarcode(code) {
  if (!/^\d+$/.test(code)) return false;
  const len = code.length;
  if (len !== 8 && len !== 12 && len !== 13) return false;

  let sum = 0;
  for (let i = 0; i < len - 1; i++) {
    const digit = parseInt(code[i], 10);
    sum += len === 8 || len === 12
      ? digit * (i % 2 === 0 ? 3 : 1)
      : digit * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(code[len - 1], 10);
}

// ── Scanning config ─────────────────────────────────────────────────
const SETTLE_MS = 1000;        // Ignore reads for 1s while user positions camera
const VOTE_WINDOW_MS = 1200;   // Collect reads for 1.2s per round
const MIN_VOTES = 3;           // At least 3 valid reads to count a round
const ROUNDS_NEEDED = 2;       // Same barcode must win 2 consecutive rounds

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [detectedCode, setDetectedCode] = useState(null);
  const [scanning, setScanning] = useState(true);
  const votesRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const prevWinnerRef = useRef(null);   // winner from previous round
  const winStreakRef = useRef(0);       // consecutive rounds with same winner

  function getWinner(votes) {
    if (votes.length < MIN_VOTES) return null;
    const counts = {};
    for (const { code } of votes) {
      counts[code] = (counts[code] || 0) + 1;
    }
    let best = null;
    let bestCount = 0;
    for (const [code, count] of Object.entries(counts)) {
      if (count > bestCount) {
        best = code;
        bestCount = count;
      }
    }
    // Winner needs >50% share and at least MIN_VOTES
    if (bestCount >= MIN_VOTES && bestCount / votes.length > 0.5) return best;
    return null;
  }

  const resolveVotes = useCallback(() => {
    const votes = votesRef.current;
    votesRef.current = [];
    timerRef.current = null;

    const winner = getWinner(votes);
    if (!winner) {
      // No clear winner — reset streak
      prevWinnerRef.current = null;
      winStreakRef.current = 0;
      return;
    }

    if (winner === prevWinnerRef.current) {
      winStreakRef.current += 1;
    } else {
      prevWinnerRef.current = winner;
      winStreakRef.current = 1;
    }

    if (winStreakRef.current >= ROUNDS_NEEDED) {
      setScanning(false);
      setDetectedCode(winner);
    }
  }, []);

  const handleBarCodeScanned = useCallback(({ type, data }) => {
    if (!scanning || detectedCode) return;
    if (!isValidBarcode(data)) return;

    const now = Date.now();

    // Ignore reads during initial settling period
    if (now - startTimeRef.current < SETTLE_MS) return;

    votesRef.current.push({ code: data, time: now });
    votesRef.current = votesRef.current.filter((v) => now - v.time < VOTE_WINDOW_MS);

    if (!timerRef.current) {
      timerRef.current = setTimeout(resolveVotes, VOTE_WINDOW_MS);
    }
  }, [scanning, detectedCode, resolveVotes]);

  function confirmBarcode() {
    router.replace(`/product/${detectedCode}`);
  }

  function rejectAndRescan() {
    setDetectedCode(null);
    votesRef.current = [];
    prevWinnerRef.current = null;
    winStreakRef.current = 0;
    startTimeRef.current = Date.now(); // fresh settling period
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setScanning(true);
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Camera Permission' }} />
        <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.permissionText}>{strings.cameraPermission}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{strings.grantPermission}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Scan Barcode',
          headerTransparent: true,
          headerTintColor: '#FFFFFF',
        }}
      />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>

          {/* ── Detected barcode confirmation ── */}
          {detectedCode ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmLabel}>Barcode detected</Text>
              <Text style={styles.confirmCode}>{detectedCode}</Text>
              <Text style={styles.confirmHint}>Is this the barcode on your product?</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity style={styles.confirmYes} onPress={confirmBarcode}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmYesText}>Yes, look up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmNo} onPress={rejectAndRescan}>
                  <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmNoText}>Wrong, rescan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.instructionText}>
                Hold steady — aligning barcode within the frame
              </Text>

              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setTorch(!torch)}
                >
                  <Ionicons
                    name={torch ? 'flash' : 'flash-outline'}
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.controlLabel}>
                    {torch ? 'Flash On' : 'Flash Off'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => router.push('/add-product')}
                >
                  <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.controlLabel}>Enter Manually</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const SCAN_AREA_SIZE = 280;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    paddingTop: 24,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 32,
  },
  controlButton: {
    alignItems: 'center',
    gap: 6,
  },
  controlLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // ── Confirmation UI ──
  confirmBox: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confirmCode: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginTop: 8,
  },
  confirmHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
  },
  confirmActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 14,
  },
  confirmYes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  confirmYesText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmNo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  confirmNoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
