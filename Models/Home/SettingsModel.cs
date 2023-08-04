using AgencyManagementCore;
using AgencyManagementCore.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AgencyManagementMVC.Models.Home
{
    public class SettingsModel
    {
        public List<GeneralSetting> General { get; set; }
        public List<DivisionSetting> Shared { get; set; }
        public List<StorageSetting> Personal { get; set; }
        public List<StorageSetting> Storage { get; set; }
        public List<CSNode> Folders { get; set; } //folders for selection
        public List<CSNode> Users { get; set; } //users for selection
    }
}