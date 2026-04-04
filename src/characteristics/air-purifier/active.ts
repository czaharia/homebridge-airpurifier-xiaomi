import { Service, Characteristic } from 'homebridge';
import { MODE } from '../../miio-consts';

// https://developers.homebridge.io/#/characteristic/Active
export function add(
  maybeDevice: Promise<any>,
  service: Service,
  characteristic: typeof Characteristic.Active,
) {
  const { ACTIVE, INACTIVE } = characteristic;

  maybeDevice.then((device) => {
    device.on('powerChanged', (isOn: boolean) => {
      service.updateCharacteristic(characteristic, isOn ? ACTIVE : INACTIVE);
    });
  });

  return service
    .getCharacteristic(characteristic)
    .onGet(async () => {
      const device = await maybeDevice;
      return (await device.power()) ? ACTIVE : INACTIVE;
    })
    .onSet(async (value) => {
      const device = await maybeDevice;
      if (value === ACTIVE) {
        await device.setPower(true);
        // Switch to Auto mode on power on
        if ((await device.mode()) !== MODE.AUTO) {
          await device.changeMode(MODE.AUTO);
        }
      } else {
        await device.setPower(false);
      }
    });
}