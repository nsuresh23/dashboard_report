import os
import pandas as pd
import numpy as np

class DataService:
    def __init__(self):
        pass

    def load_data(self, sheet_name="Load"):
        file_path = os.getenv('REPORT_EXCEL_FILE')
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        df.columns = df.columns.str.lower().str.replace(" ", "_").str.replace("\n", "", regex=False)

        # Fill missing values
        for col in df.columns:
            if pd.api.types.is_object_dtype(df[col]):
                df[col] = df[col].fillna("")
            elif pd.api.types.is_string_dtype(df[col]):
                df[col] = df[col].fillna("")
            elif pd.api.types.is_datetime64_any_dtype(df[col]) or pd.api.types.is_timedelta64_dtype(df[col]):
                df[col] = df[col].fillna(pd.NaT)
            else:
                df[col] = df[col].fillna(0)
        return df

    @staticmethod
    def format_date_column(df, column_name="date"):
        if column_name in df.columns:
            df[column_name] = pd.to_datetime(df[column_name], errors='coerce')
            df[column_name] = df[column_name].apply(
                lambda x: x.strftime("%d-%m-%Y") if pd.notna(x) else ""
            )
        return df

    @staticmethod
    def filter_data(df, filters):
        if filters.get("type_of_import", []):
            df = df[df['type_ofimport'].isin(filters.get("type_of_import", []))]

        if filters.get("batch_name", []):
            df = df[df['batch_name'].isin(filters.get("batch_name", []))]

        if filters.get("object_type", []):
            df = df[df['object_type(real_name)'].isin(filters.get("object_type", []))]
        return df

    @staticmethod
    def format_to_serializable(df):
        def convert_to_serializable(obj):
            if isinstance(obj, np.int64):
                obj = int(obj)
            elif isinstance(obj, np.float64):
                obj = float(obj)
            elif isinstance(obj, pd.Timestamp) and pd.isna(obj):
                obj = None
            else:
                obj = str(obj)
            return obj

        return df.map(convert_to_serializable)
    
    def calculate_total_time_taken(self, df):        
        time_taken = pd.to_timedelta(df["time_taken"], errors="coerce")
        time_taken = time_taken.apply(
            lambda x: x if (x != 0 and x != "" and pd.notna(x)) else pd.Timedelta(0)
        )
        total_time = time_taken.sum()
        
        days = total_time.days
        hours, remainder = divmod(total_time.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        total_time_taken = {"days": days, "hours": hours, "minutes": minutes, "seconds": seconds}
        return total_time_taken
    
    def get_total_summary(self, df):
        total_summary = {}
        total_summary["total_batches"] = df["batch_name"].nunique()
        total_summary["total_lines"] = int(df["count_of_lines_in_batch_file"].sum())
        total_summary["total_success"] = int(df["successful_count"].sum())
        total_summary["total_failures"] = int(df["failure_count"].sum())
        total_time_taken = self.calculate_total_time_taken(df)
        total_summary["total_time_taken"] = total_time_taken
        total_time_str = f"{total_time_taken.get('days')} days {total_time_taken.get('hours')} hours {total_time_taken.get('minutes')} minutes {total_time_taken.get('seconds')} seconds"
        total_summary["total_time_taken_str"] = total_time_str

        df = df[df['status'].notna() & (df['status'] != '')]
        total_summary["status_list"] = df['status'].unique().tolist()
        status_group = df.groupby('status').size().reset_index(name="count")
        total_summary["status_data"] = [
            {"value": row["count"], "name": row['status']} for _, row in status_group.iterrows()
        ]

        return total_summary

