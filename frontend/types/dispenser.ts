export const weekdayMap: { [key: number]: string } = {
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