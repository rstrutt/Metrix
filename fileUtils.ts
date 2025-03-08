import RNFS, { readFile, writeFile, exists } from 'react-native-fs';

const METRICS_FILE_PATH = `${RNFS.DocumentDirectoryPath}/metrics.csv`;
const METRIC_VALUES_FILE_PATH = `${RNFS.DocumentDirectoryPath}/metric_values.csv`;

export const readMetricsFromFile = async () => {
    try {
        const fileExists = await exists(METRICS_FILE_PATH);
        if (!fileExists) {
            await writeFile(METRICS_FILE_PATH, '', 'utf8');
        }
        const fileContent = await readFile(METRICS_FILE_PATH, 'utf8');
        return fileContent.split('\n').filter(Boolean);
    } catch (error) {
        console.error('Error reading metrics file:', error);
        return [];
    }
};

export const saveMetricsToFile = async (metricsArray: string[]) => {
    try {
        const fileContent = metricsArray.join('\n');
        await writeFile(METRICS_FILE_PATH, fileContent, 'utf8');
    } catch (error) {
        console.error('Error writing metrics file:', error);
    }
};

export const saveMetricValuesToFile = async (metricValues: { [key: string]: number }, dateTime: string) => {
    try {
        const fileContent = Object.entries(metricValues)
            .map(([metric, value]) => `${dateTime},${metric},${value}`)
            .join('\n');
        await writeFile(METRIC_VALUES_FILE_PATH, fileContent, 'utf8');
    } catch (error) {
        console.error('Error writing metric values file:', error);
    }
};
