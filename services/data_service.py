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
        if filters.get("type", []) and df.get("type") is not None:
            df = df[df['type'].isin(filters.get("type", []))]

        if filters.get("type_of_import", []) and df.get("type_ofimport") is not None:
            df = df[df['type_ofimport'].isin(filters.get("type_of_import", []))]

        if filters.get("batch_name", []) and df.get("batch_name") is not None:
            df = df[df['batch_name'].isin(filters.get("batch_name", []))]

        if filters.get("object_type", []) and df.get("object_type(real_name)") is not None:
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

        return df.applymap(convert_to_serializable)
    
    def calculate_total_time_taken(self, df):
        total_time_taken = {"days": 0, "hours": 0, "minutes": 0, "seconds": 0}
        if df.get("time_taken") is not None:       
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
        
        total_summary["total_batches"] = df["batch_name"].nunique() if df.get("batch_name") is not None else 0
        total_summary["total_lines"] = int(df["count_of_lines_in_batch_file"].sum()) if df.get("count_of_lines_in_batch_file") is not None else 0
        total_summary["total_success"] = int(df["successful_count"].sum()) if df.get("successful_count") is not None else 0
        total_summary["total_failures"] = int(df["failure_count"].sum()) if df.get("failure_count") is not None else 0
        total_time_taken = self.calculate_total_time_taken(df)
        total_summary["total_time_taken"] = total_time_taken
        total_time_str = f"{total_time_taken.get('days')} days {total_time_taken.get('hours')} hours {total_time_taken.get('minutes')} minutes {total_time_taken.get('seconds')} seconds"
        total_summary["total_time_taken_str"] = total_time_str

        total_summary["status_data"] = []
        if df.get('status') is not None:
            df = df[df['status'].notna() & (df['status'] != '')]
            total_summary["status_list"] = df['status'].unique().tolist()
            status_group = df.groupby('status').size().reset_index(name="count")
            total_summary["status_data"] = [
                {"value": row["count"], "name": row['status']} for _, row in status_group.iterrows()
            ]

        return total_summary

    def get_overview_df_data(self, count_df, load_df):
        for row_index, row in count_df.iterrows():
            # Filter load_df based on the condition for overview_completed_count
            if "type" in row and "object_type(real_name)" in load_df.columns and "status" in load_df.columns and "successful_count" in load_df.columns:
                completed_count = int(
                    load_df[load_df["object_type(real_name)"].isin([row["type"]]) & load_df["status"].isin(["Completed"])]["successful_count"].sum()
                )
                count_df.at[row_index, "completed_count"] = completed_count
                if "total_count" in row:
                    completed_percentage = round((completed_count / int(row["total_count"])) * 100, 2)
                    count_df.at[row_index, "completed_percentage"] = completed_percentage
                    # progress_html = f"<div class='progress progress-xs mb-0'><div class='progress-bar progress-bar-success' style='width: {completed_percentage}%'></div></div>"

                    progress_html = f"""<span class='font-12 head-font txt-dark'>Completed<span class='pull-right'>{completed_percentage}%</span></span>
                    <div class='progress mt-10 mb-30'>
                        <div class='progress-bar progress-bar-success' aria-valuenow='{completed_count}' aria-valuemin='0' aria-valuemax='100' style='width: 80%' role='progressbar'></div>
                    </div>"""

                    count_df.at[row_index, "progress"] = progress_html
        count_df["completed_count"] = count_df["completed_count"].astype(int)
        return count_df
    
    def get_overview_total_summary(self, count_df):
        total_summary = {}
        total_summary["overview_total_count"] = int(count_df["total_count"].sum()) if "total_count" in count_df.columns else 0
        total_summary["overview_completed_count"] = int(count_df["completed_count"].sum()) if "completed_count" in count_df.columns else 0

        # Defining status list and data
        total_summary["status_list"] = ["Completed", "Total"]
        total_summary["status_data"] = [
            {"value": total_summary["overview_completed_count"], "name": "Completed"},
            {"value": total_summary["overview_total_count"], "name": "Total"},
        ]

        return total_summary
