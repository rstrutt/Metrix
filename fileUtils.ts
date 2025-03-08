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

export const readMetricValuesFromFile = async () => {
    try {
        const fileExists = await exists(METRIC_VALUES_FILE_PATH);
        if (!fileExists) {
            await writeFile(METRIC_VALUES_FILE_PATH, '', 'utf8');
        }
        const fileContent = await readFile(METRIC_VALUES_FILE_PATH, 'utf8');
        return fileContent.split('\n').filter(Boolean).map(line => {
            const [dateTime, metric, value] = line.split(',');
            return { dateTime, metric, value: parseFloat(value) };
        });
    } catch (error) {
        console.error('Error reading metric values file:', error);
        return [];
    }
};

export const saveMetricValuesToFile = async (metricValues: { [key: string]: number }, dateTime: string) => {
    try {
        // Read the existing contents of the file
        const existingFileContent = await readFile(METRIC_VALUES_FILE_PATH, 'utf8');

        // Prepare the new content to be appended
        const newFileContent = Object.entries(metricValues)
            .map(([metric, value]) => `${dateTime},${metric},${value}`)
            .join('\n');

        // Append the new content to the existing content
        const updatedFileContent = existingFileContent ? `${existingFileContent}\n${newFileContent}` : newFileContent;

        // Write the updated content back to the file
        await writeFile(METRIC_VALUES_FILE_PATH, updatedFileContent, 'utf8');
    } catch (error) {
        console.error('Error writing metric values file:', error);
    }
};

export const updateMetricValueInFile = async (updatedEntry: { dateTime: string, metric: string, value: number }) => {
    try {
        const entries = await readMetricValuesFromFile();
        const updatedEntries = entries.map(entry =>
            entry.dateTime === updatedEntry.dateTime && entry.metric === updatedEntry.metric
                ? updatedEntry
                : entry
        );
        const fileContent = updatedEntries.map(entry => `${entry.dateTime},${entry.metric},${entry.value}`).join('\n');
        await writeFile(METRIC_VALUES_FILE_PATH, fileContent, 'utf8');
    } catch (error) {
        console.error('Error updating metric value in file:', error);
    }
};

export const deleteMetricValueFromFile = async (dateTime: string, metric: string, value: number) => {
    try {
        console.log("Deleting metric value from file with metric, dateTime, value:", dateTime, metric, value);
        const entries = await readMetricValuesFromFile();
        const updatedEntries = entries.filter(entry => !(entry.dateTime === dateTime && entry.metric === metric && entry.value===parseFloat(metric)));
        const fileContent = updatedEntries.map(entry => `${entry.dateTime},${entry.metric},${entry.value}`).join('\n');
        await writeFile(METRIC_VALUES_FILE_PATH, fileContent, 'utf8');
    } catch (error) {
        console.error('Error deleting metric value from file:', error);
    }
};
