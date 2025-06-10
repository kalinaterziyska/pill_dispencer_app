import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Button, View } from 'react-native';
import { Image } from 'expo-image';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const weekdayMap: { [key: number]: string } = {
  1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'
};

export interface Schedule {
  id?: number;
  time: string;
  weekday?: number;
}

/** One physical slot inside the dispenser. */
export interface Slot {
  id: number;
  dispenser: number;   // always matches the parent container's id
  slot_number: number;
  name: string;
  schedules: Schedule[];
}

/** The top-level container returned by ContainerSerializer. */
export interface Container {
  id: number;
  name: string;
  owner: string;
  containers: Slot[];  // nested array of Slot objects
}

interface DispenserFromApi {
  id: number;
  name: string;
  owner: string;
  containers: Container[];
}

export default function HomeScreen() {
  const { token } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [newContainerSerialId, setNewContainerSerialId] = useState('');

  // State for the edit slot modal
  const [isEditSlotModalVisible, setEditSlotModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [editingPillName, setEditingPillName] = useState('');
  const [editingSchedules, setEditingSchedules] = useState<Schedule[]>([]);

  async function loadContainers() {
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
  
      const res = await fetch('http://localhost:8000/api/list-all-user-dispensers/', { headers });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: Container[] = await res.json();
      console.log('loaded containers:', data);
      setContainers(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContainers();
  }, [token]);

  const handleAddContainer = async () => {
    setModalError(null); // Clear previous modal error
    if (!newContainerName || !newContainerSerialId) {
      setModalError("Please provide a name and a serial ID.");
      return;
    }
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const body = JSON.stringify({ name: newContainerName, serial_id: newContainerSerialId });
      const res = await fetch('http://localhost:8000/api/register-dispenser/', {
        method: 'POST',
        headers,
        body,
      });
      if (!res.ok) {
        const errorData = await res.json();
        const detail = errorData.detail || errorData.name?.[0] || errorData.serial_id?.[0] || 'An unknown error occurred.';
        throw new Error(detail);
      }
      setNewContainerName('');
      setNewContainerSerialId('');
      setAddModalVisible(false);
      loadContainers(); // Refresh the list
    } catch (err: any) {
      setModalError(err.message);
    }
  };

  const handleOpenEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
    setEditingPillName(slot.name);
    setEditingSchedules(slot.schedules.map(s => ({ ...s }))); // Deep copy
    setEditSlotModalVisible(true);
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot || !selectedContainer) return;
  
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      
      const body = JSON.stringify({
        dispenser_name: selectedContainer.name,
        slot_number: editingSlot.slot_number,
        pill_name: editingPillName,
        schedules: editingSchedules.map(({ time, weekday }) => ({ time, weekday })),
      });
  
      const res = await fetch('http://localhost:8000/api/container-schedule/', {
        method: 'PUT',
        headers,
        body,
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update slot.');
      }
  
      // Close modal and refresh data
      setEditSlotModalVisible(false);
      loadContainers();
  
    } catch (err: any) {
      // You could set an error state for the edit modal here
      console.error(err.message);
    }
  };

  if (loading && containers.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading your containers…</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="error" style={styles.errorText}>{error}</ThemedText>
        <Button title="Retry" onPress={() => { setError(null); loadContainers(); }} />
      </ThemedView>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
        headerImage={
          <Image
            source={require('@/assets/images/kitty-removebg-preview1.png')}
            style={styles.kittyImage}
          />
        }>
        <View style={styles.mainContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Your Containers</ThemedText>
          </ThemedView>

          {error && (
            <ThemedView style={styles.errorContainer}>
              <ThemedText type="error" style={styles.errorText}>{error}</ThemedText>
              <Button title="Retry" onPress={() => { setError(null); loadContainers(); }} />
            </ThemedView>
          )}

          <ThemedView style={styles.containerList}>
            {containers.map((container, i) => (
              <TouchableOpacity
                key={i}
                style={styles.stepContainer}
                onPress={() => setSelectedContainer(container)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.stepText}>{container.name || `Container ${container.id}`}</ThemedText>
                <Image source={require('@/assets/images/microwave.avif')} style={styles.stepImage} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </View>
      </ParallaxScrollView>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
        >
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setAddModalVisible(false);
          setModalError(null);
        }}
      >
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
          headerImage={
            <Image
              source={require('@/assets/images/kitty-removebg-preview1.png')}
              style={styles.kittyImage}
            />
          }
        >
          <ThemedView style={styles.formContainer}>
            <ThemedText type="title">Add New Dispenser</ThemedText>
            <ThemedText style={{ marginBottom: 24, color: '#555', textAlign: 'center' }}>
              Enter a unique name and the serial ID for your new dispenser.
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Dispenser Name"
              value={newContainerName}
              onChangeText={(text) => {
                setNewContainerName(text);
                if (modalError) setModalError(null);
              }}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="Serial ID"
              value={newContainerSerialId}
              onChangeText={(text) => {
                setNewContainerSerialId(text);
                if (modalError) setModalError(null);
              }}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddContainer}>
              <ThemedText style={styles.modalButtonText}>Add Dispenser</ThemedText>
            </TouchableOpacity>
            {modalError && <ThemedText type="error" style={{ marginTop: 16, textAlign: 'center' }}>{modalError}</ThemedText>}
            <TouchableOpacity
              onPress={() => {
                setAddModalVisible(false);
                setModalError(null);
              }}
              style={styles.closeButton}
            >
              <ThemedText style={{ color: '#645273' }}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ParallaxScrollView>
      </Modal>

      <Modal
        visible={selectedContainer !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedContainer(null)}
      >
        {selectedContainer && (
          <ParallaxScrollView
            headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
            headerImage={
              <Image source={require('@/assets/images/microwave.avif')} style={styles.headerImage} />
            }
          >
            <TouchableOpacity 
              style={[styles.backButton, { paddingLeft: 0 }]}
              onPress={() => setSelectedContainer(null)}
            >
              <IconSymbol name="chevron.left" size={24} color="#645273" />
              <ThemedText>Back to Containers</ThemedText>
            </TouchableOpacity>

            <ThemedText type="title">{selectedContainer.name || `Container ${selectedContainer.id}`}</ThemedText>
            
            <ThemedText>ID: {selectedContainer.id}</ThemedText>

            <ThemedView style={styles.schedulesContainer}>
              <ThemedText type="subtitle">Slots & Schedules</ThemedText>
              {selectedContainer.containers?.map((slot) => (
                <ThemedView key={slot.id} style={styles.scheduleItem}>
                  <View style={styles.slotHeader}>
                    <ThemedText style={styles.slotTitle}>{slot.name || `Slot ${slot.slot_number}`}</ThemedText>
                    <Button title="Edit" onPress={() => handleOpenEditSlot(slot)} />
                  </View>
                  {slot.schedules?.length > 0 ? (
                    slot.schedules.map((schedule: Schedule, index: number) => (
                      <ThemedText key={index} style={styles.scheduleText}>
                        {schedule.weekday ? `${weekdayMap[schedule.weekday]}: ` : ''}{schedule.time}
                      </ThemedText>
                    ))
                  ) : (
                    <ThemedText style={styles.emptyText}>No schedules set</ThemedText>
                  )}
                </ThemedView>
              ))}
            </ThemedView>
          </ParallaxScrollView>
        )}
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        visible={isEditSlotModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditSlotModalVisible(false)}
      >
        {editingSlot && (
          <ParallaxScrollView
            headerBackgroundColor={{ light: '#9669C7', dark: '#645273' }}
            headerImage={
              <Image
                source={require('@/assets/images/kitty-removebg-preview1.png')}
                style={styles.kittyImage}
              />
            }
          >
            <ThemedView style={styles.formContainer}>
              <ThemedText type="title">Edit Slot {editingSlot.slot_number}</ThemedText>
              
              <ThemedText style={styles.label}>Pill Name</ThemedText>
              <TextInput
                style={styles.input}
                value={editingPillName}
                onChangeText={setEditingPillName}
                placeholderTextColor="#999"
              />

              <ThemedText style={styles.label}>Schedules</ThemedText>
              {editingSchedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleInputContainer}>
                  <TextInput
                    style={styles.scheduleInput}
                    value={schedule.time}
                    onChangeText={(time) => {
                      const newSchedules = [...editingSchedules];
                      newSchedules[index].time = time;
                      setEditingSchedules(newSchedules);
                    }}
                    placeholder="Time (HH:MM:SS)"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.scheduleInput, { flex: 0.5 }]}
                    value={schedule.weekday?.toString() ?? ''}
                    onChangeText={(day) => {
                      const newSchedules = [...editingSchedules];
                      newSchedules[index].weekday = parseInt(day, 10) || undefined;
                      setEditingSchedules(newSchedules);
                    }}
                    placeholder="Day"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      const newSchedules = editingSchedules.filter((_, i) => i !== index);
                      setEditingSchedules(newSchedules);
                    }}
                    style={styles.deleteButton}
                  >
                    <ThemedText style={{ color: 'white' }}>Del</ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.modalButton, { marginTop: 10, backgroundColor: '#5a5a5a' }]}
                onPress={() => {
                  setEditingSchedules([...editingSchedules, { time: '12:00:00', weekday: 1 }]);
                }}
              >
                <ThemedText style={styles.modalButtonText}>Add Schedule</ThemedText>
              </TouchableOpacity>
              
              <View style={{ marginTop: 30, width: '100%' }}>
                <TouchableOpacity style={styles.modalButton} onPress={handleUpdateSlot}>
                  <ThemedText style={styles.modalButtonText}>Save Changes</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: 'transparent', marginTop: 10 }]}
                  onPress={() => setEditSlotModalVisible(false)}
                >
                  <ThemedText style={{ color: '#aaa' }}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </ParallaxScrollView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    padding: 16,
  },
  containerList: {
    paddingHorizontal: 0,
    flexDirection: "column",
    alignItems: "center",
    gap: 40
  },
  stepContainer: {
    width: 200,
    marginRight: 16,
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
  },
  stepText: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  stepImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  kittyImage: {
    width: 450,
    position: 'static',
    bottom: 0,
    left: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  detailsContainer: {
    marginTop: 24,
    gap: 8,
  },
  schedulesContainer: {
    marginTop: 24,
    gap: 16,
  },
  scheduleItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  slotTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scheduleText: {
    fontSize: 16,
    color: '#645273',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  formContainer: {
    alignItems: 'center',
  },
  input: {
    height: 50,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    width: '100%',
    borderRadius: 10,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: -5,
    marginTop: 15,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    paddingHorizontal: 15,
    height: 50,
    justifyContent: 'center',
    borderRadius: 10,
  },
  modalButton: {
    backgroundColor: '#645273',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
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
    marginTop: 20,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 90,
    right: 32,
    zIndex: 1000,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#645273',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  scheduleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 5,
  },
  scheduleInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#555',
    backgroundColor: '#333',
    color: 'white',
    padding: 10,
    borderRadius: 10,
  },
});


