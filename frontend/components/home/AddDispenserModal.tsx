import React, { useState } from 'react';
import { Modal, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FormField from '@/components/ui/FormField';

interface AddDispenserModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddContainer: (name: string, serialId: string) => Promise<void>;
}

export default function AddDispenserModal({ isVisible, onClose, onAddContainer }: AddDispenserModalProps) {
  const [name, setName] = useState('');
  const [serialId, setSerialId] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleAdd = async () => {
    setModalError(null);
    if (!name || !serialId) {
      setModalError("Please provide a name and a serial ID.");
      return;
    }
    try {
      await onAddContainer(name, serialId);
      setName('');
      setSerialId('');
      onClose();
    } catch (err: any) {
      setModalError(err.message);
    }
  };

  const handleClose = () => {
    setModalError(null);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#121212' }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.header}>
              <Image
                source={require('@/assets/images/kitty-removebg-preview1.png')}
                style={styles.kittyImage}
              />
              <ThemedText type="title" style={styles.title}>Add New Dispenser</ThemedText>
              <ThemedText style={styles.subtitle}>
                Enter a unique name and the serial ID for your new dispenser.
              </ThemedText>
            </View>

            <View style={styles.formContainer}>
              <FormField
                label="Dispenser Name"
                placeholder="e.g., Morning Meds"
                value={name}
                onChangeText={(text: string) => {
                  setName(text);
                  if (modalError) setModalError(null);
                }}
                icon="cube"
              />
              <FormField
                label="Serial ID"
                placeholder="Find this on the back of the device"
                value={serialId}
                onChangeText={(text: string) => {
                  setSerialId(text);
                  if (modalError) setModalError(null);
                }}
                icon="barcode"
              />
              {modalError && <ThemedText type="error" style={styles.errorText}>{modalError}</ThemedText>}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.modalButton} onPress={handleAdd}>
              <ThemedText style={styles.modalButtonText}>Add Dispenser</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#121212',
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  kittyImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  footer: {
    paddingBottom: 20,
  },
  modalButton: {
    backgroundColor: '#645273',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#645273',
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center'
  },
}); 