import RNFS, { readFile, writeFile, exists } from 'react-native-fs';


export const METRICS_FILE_PATH = `${RNFS.DocumentDirectoryPath}/metrics.csv`;
export const METRIC_VALUES_FILE_PATH = `${RNFS.DocumentDirectoryPath}/metric_values.csv`;

export const readAppFile = async (filePath: string): Promise<string> => {
    try {
        const fileExists = await exists(filePath);
        if (!fileExists) {
            await writeFile(filePath, '', 'utf8');
        }
        const fileContent = await RNFS.readFile(filePath, 'utf8');
        return fileContent;
    } catch (error) {
        console.error('Error reading file:', error);
        return '';
    }
};

export const writeAppFile = async (filePath: string, content: string): Promise<void> => {
    try {
        await RNFS.writeFile(filePath, content, 'utf8');
    } catch (error) {
        console.error('Error writing file:', error);
    }
};

export const readMetricsFromFile = async () => {
    try {
        const fileExists = await exists(METRICS_FILE_PATH);
        if (!fileExists) {
            await writeFile(METRICS_FILE_PATH, '', 'utf8');
        }
        const fileContent = await readFile(METRICS_FILE_PATH, 'utf8');
        return fileContent.split('\n').filter(Boolean).map(line => {
            const [name, min_threshold, max_threshold] = line.split(',');
            return { name, min_threshold: parseFloat(min_threshold), max_threshold: parseFloat(max_threshold) };
        });
    } catch (error) {
        console.error('Error reading metrics file:', error);
        return [];
    }
};

export const saveMetricsToFile = async (metricsArray: { name: string, min_threshold: number, max_threshold: number }[]) => {
    try {
        const fileContent = metricsArray.map(metric => `${metric.name},${metric.min_threshold},${metric.max_threshold}`).join('\n');
        await writeFile(METRICS_FILE_PATH, fileContent, 'utf8');
    } catch (error) {
        console.error('Error writing metrics file:', error);
    }
};

export const readMetricValuesFromFile = async (convertFromUTC: boolean) => {
    try {
        const fileExists = await exists(METRIC_VALUES_FILE_PATH);
        if (!fileExists) {
            await writeFile(METRIC_VALUES_FILE_PATH, '', 'utf8');
        }
        const fileContent = await readFile(METRIC_VALUES_FILE_PATH, 'utf8');

        return fileContent.split('\n').filter(Boolean).map(line => {
            const [dateTimeFromFile, metric, value] = line.split(',');

            // Switch the dateTime from UTC (in the file) to local if we asked for that
            if (convertFromUTC){
                let dateTimeUTCString = dateTimeFromFile;
                if (!dateTimeFromFile.includes('T')) {
                    // If the dateTime is not in the format 'yyyy-mm-ddThh:mm:ssZ', then convert it
                    dateTimeUTCString = dateTimeFromFile.replace(' ', 'T') + ':00Z'
                }

                console.log(dateTimeUTCString);
                const dateTimeUTC = new Date(dateTimeUTCString);
                const formattedDate = dateTimeUTC.toLocaleDateString('en-CA'); // 'en-CA' locale ensures 'yyyy-mm-dd' format
                const formattedTime = dateTimeUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 'hh:mm' format
                const dateTimeLocalString = `${formattedDate} ${formattedTime}`;
                console.log(dateTimeLocalString);

                return { dateTime: dateTimeLocalString, metric, value: parseFloat(value) };
            }
            else{
                return { dateTime: dateTimeFromFile, metric, value: parseFloat(value) };
            }

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

        // File is always UTC in the file, but the incoming dateTime string is in local.  Need to convert to UTC
        const dateTimeUTC = new Date(dateTime);
        // Now pull out the UTC values
        const dateTimeUTCDateString = dateTimeUTC.toISOString().split('T')[0]
        const dateTimeUTCTimeString = dateTimeUTC.toISOString().split('T')[1].slice(0, 5)
        const dateTimeUTCString = `${dateTimeUTCDateString} ${dateTimeUTCTimeString}`;

        // Prepare the new content to be appended
        const newFileContent = Object.entries(metricValues)
            .map(([metric, value]) => `${dateTimeUTCString},${metric},${value}`)
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

        // File is always UTC in the file, but the incoming dateTime string is in local.  Need to convert to UTC
        const dateTimeUTC = new Date(updatedEntry.dateTime);
        // Now pull out the UTC values
        const dateTimeUTCDateString = dateTimeUTC.toISOString().split('T')[0]
        const dateTimeUTCTimeString = dateTimeUTC.toISOString().split('T')[1].slice(0, 5)
        const dateTimeUTCString = `${dateTimeUTCDateString} ${dateTimeUTCTimeString}`;


        const entries = await readMetricValuesFromFile(false);
        const updatedEntries = entries.map(entry =>
            entry.dateTime === dateTimeUTCString && entry.metric === updatedEntry.metric
                ? {dateTime: dateTimeUTCString, metric: updatedEntry.metric, value: updatedEntry.value}
                : entry
        );
        const fileContent = updatedEntries.map(entry => `${entry.dateTime},${entry.metric},${entry.value}`).join('\n');
        await writeFile(METRIC_VALUES_FILE_PATH, fileContent, 'utf8');
    } catch (error) {
        console.error('Error updating metric value in file:', error);
    }
};

function floatEquals(a: number, b: number, epsilon = 0.0001) {
    return Math.abs(a - b) < epsilon;
}

export const deleteMetricValueFromFile = async (dateTime: string, metric: string, value: number) => {
    try {

        // File is always UTC in the file, but the incoming dateTime string is in local.  Need to convert to UTC
        const dateTimeUTC = new Date(dateTime);
        // Now pull out the UTC values
        const dateTimeUTCDateString = dateTimeUTC.toISOString().split('T')[0]
        const dateTimeUTCTimeString = dateTimeUTC.toISOString().split('T')[1].slice(0, 5)
        const dateTimeUTCString = `${dateTimeUTCDateString} ${dateTimeUTCTimeString}`;

        console.log("Deleting metric value from file with metric, dateTime, value:", dateTime, metric, value);
        const entries = await readMetricValuesFromFile(false);
        const updatedEntries = entries.filter((entry: { dateTime: string, metric: string, value: number }) =>
            !(entry.dateTime === dateTimeUTCString && entry.metric === metric && floatEquals(entry.value, value))
        );

        const fileContent = updatedEntries.map(entry => `${entry.dateTime},${entry.metric},${entry.value}`).join('\n');
        await writeFile(METRIC_VALUES_FILE_PATH, fileContent, 'utf8');

    } catch (error) {
        console.error('Error deleting metric value from file:', error);
    }
};
