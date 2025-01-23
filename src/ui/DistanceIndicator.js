export class DistanceIndicator {
    constructor() {
        this.domElement = document.createElement('div');
        this.domElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            color: white;
            font-family: monospace;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
        `;
    }

    update(cameraPosition) {
        const distance = cameraPosition.length();
        let unit = 'km';
        let value = distance;
        
        if(distance > 1e9) {
            value = distance / 9.461e12; // 转换为光年
            unit = 'ly';
        } else if(distance > 1e6) {
            value = distance / 1.496e8; // 转换为AU
            unit = 'AU';
        }

        this.domElement.textContent = 
            `观测距离: ${value.toExponential(2)} ${unit}`;
    }
}